const io = require('socket.io-client');

// Connexion au serveur
const socket = io('http://localhost:3001');

// Événements de connexion
socket.on('connect', () => {
    console.log('✅ Connecté au serveur avec l\'ID:', socket.id);
});

// Écouter le message de bienvenue
socket.on('welcome', (data) => {
    console.log('🎉 Message de bienvenue reçu:', data);
});

// Écouter les notifications de nouveaux joueurs
socket.on('playerJoined', (data) => {
    console.log('👥 Nouveau joueur rejoint:', data);
});

// Écouter les notifications de déconnexion
socket.on('playerLeft', (data) => {
    console.log('👋 Joueur parti:', data);
});

// Écouter les réponses aux instructions
socket.on('instructionResponse', (data) => {
    console.log('📝 Réponse instruction:', data);
});

// Écouter les réponses aux messages de test
socket.on('testResponse', (data) => {
    console.log('🧪 Réponse test:', data);
});

// Écouter les broadcasts de test
socket.on('testBroadcast', (data) => {
    console.log('📢 Broadcast test:', data);
});

// Écouter les réponses de statut
socket.on('statusResponse', (data) => {
    console.log('📊 Statut du serveur:', data);
});

// Après la connexion, envoyer des messages de test
socket.on('connect', () => {
    console.log('\n--- Envoi de messages de test ---');
    
    // Test 1: Message de test
    setTimeout(() => {
        console.log('📤 Envoi d\'un message de test...');
        socket.emit('testMessage', {
            message: 'Ceci est un message de test',
            timestamp: new Date().toISOString()
        });
    }, 1000);
    
    // Test 2: Demande de statut
    setTimeout(() => {
        console.log('📤 Demande du statut du serveur...');
        socket.emit('getStatus', {});
    }, 2000);
    
    // Test 3: Instruction
    setTimeout(() => {
        console.log('📤 Envoi d\'une instruction...');
        socket.emit('instruction', {
            action: 'move',
            direction: 'north',
            data: { x: 10, y: 20 }
        });
    }, 3000);
});

// Gestion des déconnexions
socket.on('disconnect', () => {
    console.log('❌ Déconnecté du serveur');
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion:', error);
});

// Fermer la connexion après 10 secondes
setTimeout(() => {
    console.log('\n--- Fermeture de la connexion ---');
    socket.disconnect();
    process.exit(0);
}, 10000);
