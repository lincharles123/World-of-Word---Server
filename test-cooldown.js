const io = require('socket.io-client');

console.log('⏰ Test du Cooldown Anti-Spam (5 secondes)');
console.log('==========================================\n');

async function testCooldown() {
  const socket = io('http://localhost:3001');
  let testResults = {
    messagesBlocked: 0,
    messagesAllowed: 0,
    violations: 0
  };

  socket.on('connect', () => {
    console.log('✅ Connecté avec ID:', socket.id);
    startCooldownTests();
  });

  socket.on('cooldownViolation', (data) => {
    console.log('🚫 Violation de cooldown:', {
      reason: data.reason,
      remaining: data.remainingCooldown,
      advice: data.advice
    });
    testResults.violations++;
    testResults.messagesBlocked++;
  });

  socket.on('cooldownActive', (data) => {
    console.log('⏳ Cooldown actif:', {
      reason: data.reason,
      remaining: data.remainingCooldown
    });
    testResults.messagesBlocked++;
  });

  socket.on('quickResponse', (data) => {
    console.log('✅ Message accepté:', {
      message: data.message,
      cooldownStatus: data.cooldownStatus
    });
    testResults.messagesAllowed++;
  });

  socket.on('cooldownStatusResponse', (data) => {
    console.log('📊 Statut du cooldown:', {
      isOnCooldown: data.cooldownStats.isOnCooldown,
      remaining: data.cooldownStats.remainingCooldown,
      violations: data.cooldownStats.violations,
      messageCount: data.cooldownStats.messageCount
    });
  });

  function startCooldownTests() {
    console.log('\n1️⃣  Test du cooldown de base (5 secondes)...\n');

    let messageCount = 0;
    const rapidInterval = setInterval(() => {
      messageCount++;
      console.log(`📤 Envoi du message ${messageCount}...`);
      socket.emit('quickMessage', {
        message: `Message rapide ${messageCount}`,
        timestamp: new Date().toISOString()
      });

      if (messageCount >= 5) {
        clearInterval(rapidInterval);
        
        setTimeout(() => {
          console.log('\n2️⃣  Test de récupération après cooldown...\n');
          
          console.log('📤 Envoi d\'un message après attente...');
          socket.emit('quickMessage', {
            message: 'Message après cooldown',
            timestamp: new Date().toISOString()
          });
          
          setTimeout(() => {
            console.log('\n3️⃣  Vérification du statut du cooldown...\n');
            socket.emit('getCooldownStatus', {});
            
            setTimeout(() => {
              console.log('\n4️⃣  Test des violations multiples...\n');
              
              for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                  console.log(`📤 Message de violation ${i + 1}...`);
                  socket.emit('quickMessage', {
                    message: `Message violation ${i + 1}`,
                    timestamp: new Date().toISOString()
                  });
                }, i * 200);
              }
              
              setTimeout(() => {
                console.log('\n📊 RÉSULTATS DU TEST COOLDOWN');
                console.log('===============================');
                console.log(`✅ Messages autorisés: ${testResults.messagesAllowed}`);
                console.log(`🚫 Messages bloqués: ${testResults.messagesBlocked}`);
                console.log(`⚠️  Violations détectées: ${testResults.violations}`);
                
                socket.emit('getCooldownStatus', {});
                
                setTimeout(() => {
                  console.log('\n✨ Test terminé !');
                  socket.disconnect();
                  process.exit(0);
                }, 2000);
              }, 5000);
            }, 2000);
          }, 1000);
        }, 6000);
      }
    }, 500);
  }

  socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  });
}

testCooldown().catch(console.error);
