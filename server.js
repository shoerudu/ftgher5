const express = require('express');
const axios = require('axios');
const path = require('path');

// Firebase
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, child } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBKL0upnWaA-gPRds-eXkxZOwSNXlkK4f0",
  authDomain: "xbit-2e51c.firebaseapp.com",
  databaseURL: "https://xbit-2e51c-default-rtdb.firebaseio.com",
  projectId: "xbit-2e51c",
  storageBucket: "xbit-2e51c.firebasestorage.app",
  messagingSenderId: "748487321293",
  appId: "1:748487321293:web:e39fac98d217342e492b84"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getDatabase(appFirebase);

// Express
const app = express();
const port = 3000;
const API_KEY = 'sk_c14CeBOCivwNYC7B'; // 🔑 Short.io API Key

app.use(express.static(__dirname));
app.use(express.json());

// Save link data to Firebase
async function saveToFirebase(linkData){
    await set(ref(db, 'links/' + linkData.linkId), linkData);
}

// Fetch Short.io data and save to Firebase
async function fetchAndSave(linkId){
    try{
        const response = await axios.get(`https://api-v2.short.io/statistics/link/${linkId}`, {
            params: { period: 'total' },
            headers: { accept: '*/*', authorization: API_KEY }
        });

        const data = response.data;
        const humanClicks = data.humanClicks || 0;
        const countries = data.country ? data.country.map(c=>({
            ...c, score: c.humanScore || c.score, countryName: c.countryName
        })) : [];

        const linkData = { linkId, humanClicks, countries };
        await saveToFirebase(linkData);
        console.log(`✅ ${linkId} saved to Firebase`);
    } catch(err){
        console.error(`Error fetching ${linkId}:`, err.message);
    }
}

// API to add link
app.post('/api/add', async (req,res)=>{
    const { linkId } = req.body;
    if(!linkId) return res.status(400).json({ error: 'Missing linkId' });

    await fetchAndSave(linkId);
    res.json({ status: 'Link added and saved to Firebase!' });
});

// Serve index.html
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')) );

app.listen(port, ()=>console.log(`✅ Server running at http://localhost:${port}`));

//////////////////////////////
// Auto-update every 20 sec
//////////////////////////////
setInterval(async ()=>{
    try{
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'links'));
        if(snapshot.exists()){
            const links = snapshot.val();
            for(const linkId in links){
                await fetchAndSave(linkId);
            }
        }
    } catch(err){
        console.error('Error in auto-update:', err.message);
    }
}, 20000); // 20 seconds
