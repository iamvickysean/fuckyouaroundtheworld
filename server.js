// Node.js server for "How to Say F*ck You Around the World" website
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get all languages
app.get('/api/languages', (req, res) => {
    try {
        // Read the data.js file and extract the language data
        const dataFilePath = path.join(__dirname, 'data.js');
        const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');
        
        // Extract the language data array from the file content
        // This is a simple approach - in a real app, you'd use a proper database
        const startMarker = 'const languageData = [';
        const endMarker = '];';
        
        const startIndex = dataFileContent.indexOf(startMarker) + startMarker.length;
        const endIndex = dataFileContent.lastIndexOf(endMarker);
        
        const languageDataString = dataFileContent.substring(startIndex, endIndex);
        
        // Convert the string to a valid JSON array
        const jsonString = '[' + languageDataString.replace(/(\w+):/g, '"$1":') + ']';
        
        // Parse the JSON string
        const languageData = JSON.parse(jsonString);
        
        // Send the language data as JSON
        res.json(languageData);
    } catch (error) {
        console.error('Error fetching language data:', error);
        res.status(500).json({ error: 'Failed to fetch language data' });
    }
});

// API endpoint to get a specific language by ID
app.get('/api/languages/:id', (req, res) => {
    try {
        const languageId = req.params.id;
        
        // Read the data.js file and extract the language data
        const dataFilePath = path.join(__dirname, 'data.js');
        const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');
        
        // Extract the language data array from the file content
        const startMarker = 'const languageData = [';
        const endMarker = '];';
        
        const startIndex = dataFileContent.indexOf(startMarker) + startMarker.length;
        const endIndex = dataFileContent.lastIndexOf(endMarker);
        
        const languageDataString = dataFileContent.substring(startIndex, endIndex);
        
        // Convert the string to a valid JSON array
        const jsonString = '[' + languageDataString.replace(/(\w+):/g, '"$1":') + ']';
        
        // Parse the JSON string
        const languageData = JSON.parse(jsonString);
        
        // Find the language with the specified ID
        const language = languageData.find(lang => lang.id === languageId);
        
        if (language) {
            res.json(language);
        } else {
            res.status(404).json({ error: 'Language not found' });
        }
    } catch (error) {
        console.error('Error fetching language data:', error);
        res.status(500).json({ error: 'Failed to fetch language data' });
    }
});

// API endpoint to generate audio for a language
app.get('/api/generate-audio/:id', (req, res) => {
    try {
        const languageId = req.params.id;
        
        // Read the data.js file and extract the language data
        const dataFilePath = path.join(__dirname, 'data.js');
        const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');
        
        // Extract the language data array from the file content
        const startMarker = 'const languageData = [';
        const endMarker = '];';
        
        const startIndex = dataFileContent.indexOf(startMarker) + startMarker.length;
        const endIndex = dataFileContent.lastIndexOf(endMarker);
        
        const languageDataString = dataFileContent.substring(startIndex, endIndex);
        
        // Convert the string to a valid JSON array
        const jsonString = '[' + languageDataString.replace(/(\w+):/g, '"$1":') + ']';
        
        // Parse the JSON string
        const languageData = JSON.parse(jsonString);
        
        // Find the language with the specified ID
        const language = languageData.find(lang => lang.id === languageId);
        
        if (!language) {
            return res.status(404).json({ error: 'Language not found' });
        }
        
        // Check if we already have an audio file for this language
        const audioFilePath = path.join(__dirname, 'audio', `${languageId}.mp3`);
        const audioExists = fs.existsSync(audioFilePath);
        
        if (audioExists) {
            // If the audio file already exists, return its URL
            return res.json({
                success: true,
                message: `Audio file already exists for language: ${language.languageName}`,
                audioUrl: `/audio/${languageId}.mp3`
            });
        }
        
        // If we have the generate-audio.js module and Google Cloud credentials,
        // we could generate the audio file here
        try {
            const generateAudio = require('./generate-audio');
            
            // Check if we can access the Google Cloud TTS client
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                // Generate the audio file
                generateAudio.generateAudioForLanguage(language)
                    .then(success => {
                        if (success) {
                            res.json({
                                success: true,
                                message: `Audio generated for language: ${language.languageName}`,
                                audioUrl: `/audio/${languageId}.mp3`
                            });
                        } else {
                            // If generation failed, return an error
                            res.status(500).json({
                                success: false,
                                message: `Failed to generate audio for language: ${language.languageName}`,
                                fallbackUrl: null
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error generating audio:', error);
                        res.status(500).json({
                            success: false,
                            message: `Error generating audio: ${error.message}`,
                            fallbackUrl: null
                        });
                    });
                return;
            }
        } catch (error) {
            // If we can't load the generate-audio module or there's another error,
            // we'll fall back to the browser-based generation
            console.log('Falling back to browser-based audio generation');
        }
        
        // For this demo without API credentials, we'll return instructions for browser-based generation
        res.json({
            success: true,
            message: `Use browser Speech Synthesis API for language: ${language.languageName}`,
            language: language,
            useBrowserSynthesis: true
        });
    } catch (error) {
        console.error('Error in generate-audio endpoint:', error);
        res.status(500).json({ error: 'Failed to process audio generation request' });
    }
});

// Serve audio files
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Serve image files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit(0);
});
