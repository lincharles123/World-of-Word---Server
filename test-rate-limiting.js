const io = require('socket.io-client');

console.log('🧪 Test du Rate Limiting WebSocket');
console.log('==================================\n');

// Fonction pour créer plusieurs clients et tester le rate limiting
async function testRateLimiting() {
  const clients = [];
  const results = {
    successful: 0,
    rateLimited: 0,
    connectionBlocked: 0
  };

  console.log('1️⃣  Test des connexions multiples...\n');

  // Créer plusieurs connexions rapidement pour tester le rate limiting des connexions
  for (let i = 0; i < 8; i++) {
    const client = io('http://localhost:3001', {
      forceNew: true,
      timeout: 5000
    });

    client.on('connect', () => {
      console.log(`✅ Client ${i + 1} connecté avec ID: ${client.id}`);
      results.successful++;
    });

    client.on('connectionRateLimitExceeded', (data) => {
      console.log(`🚫 Client ${i + 1} - Connexion rate limitée:`, data);
      results.connectionBlocked++;
    });

    client.on('connect_error', (error) => {
      console.log(`❌ Client ${i + 1} - Erreur de connexion:`, error.message);
    });

    clients.push(client);
    
    // Petit délai entre les connexions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Attendre que toutes les connexions se stabilisent
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n2️⃣  Test des messages en rafale...\n');

  // Pour chaque client connecté, envoyer beaucoup de messages rapidement
  clients.forEach((client, index) => {
    if (client.connected) {
      console.log(`📤 Envoi de messages en rafale du client ${index + 1}...`);
      
      client.on('rateLimitExceeded', (data) => {
        console.log(`🚫 Client ${index + 1} - Message rate limité:`, {
          reason: data.reason,
          retryAfter: data.retryAfter
        });
        results.rateLimited++;
      });

      client.on('testResponse', (data) => {
        console.log(`📨 Client ${index + 1} - Réponse reçue: ${data.message}`);
      });

      // Envoyer 20 messages rapidement pour déclencher le rate limiting
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          if (client.connected) {
            client.emit('testMessage', {
              message: `Message rapide ${i + 1}`,
              clientIndex: index + 1,
              timestamp: new Date().toISOString()
            });
          }
        }, i * 50); // Un message toutes les 50ms
      }
    }
  });

  // Attendre que tous les messages soient traités
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n3️⃣  Test de récupération après rate limiting...\n');

  // Attendre un peu puis essayer d'envoyer des messages à nouveau
  setTimeout(() => {
    clients.forEach((client, index) => {
      if (client.connected) {
        console.log(`🔄 Client ${index + 1} - Test de récupération...`);
        client.emit('testMessage', {
          message: 'Message après rate limiting',
          clientIndex: index + 1,
          timestamp: new Date().toISOString()
        });
      }
    });
  }, 3000);

  // Résumé des résultats après 10 secondes
  setTimeout(() => {
    console.log('\n📊 RÉSULTATS DU TEST');
    console.log('====================');
    console.log(`✅ Connexions réussies: ${results.successful}`);
    console.log(`🚫 Connexions bloquées: ${results.connectionBlocked}`);
    console.log(`🚫 Messages rate limités: ${results.rateLimited}`);
    
    // Fermer toutes les connexions
    clients.forEach(client => {
      if (client.connected) {
        client.disconnect();
      }
    });

    console.log('\n✨ Test terminé !');
    process.exit(0);
  }, 10000);
}

// Lancer le test
testRateLimiting().catch(console.error);
