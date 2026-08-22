const ngrok = require('@ngrok/ngrok');

async function startNgrok() {
  try {
    // Set authtoken
    await ngrok.authtoken('2nOmohQPCyqVHZemWG4JlD3bJEn_6QL83i5t8STojSPzRee7b');
    
    // Start tunnel for frontend
    const url = await ngrok.connect({
      addr: 5175,
      authtoken: '2nOmohQPCyqVHZemWG4JlD3bJEn_6QL83i5t8STojSPzRee7b'
    });
    
    console.log('================================================');
    console.log('🎉 Your app is publicly accessible!');
    console.log('================================================');
    console.log(`Public URL: ${url}`);
    console.log('================================================');
    console.log('Share this URL with your mom!');
    console.log('The tunnel will stay active as long as this window is open.');
    console.log('Press Ctrl+C to stop the tunnel.');
    
    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    console.error('Error starting ngrok:', error);
  }
}

startNgrok();