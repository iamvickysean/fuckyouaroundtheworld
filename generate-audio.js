// Script to generate audio files for all languages using Google Cloud Text-to-Speech API
// Note: You need to set up Google Cloud credentials before running this script
// See: https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries

const fs = require('fs');
const path = require('path');
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');

// Import language data
const languageDataPath = path.join(__dirname, 'data.js');
const languageDataContent = fs.readFileSync(languageDataPath, 'utf8');
const startMarker = 'const languageData = [';
const endMarker = '];';
const startIndex = languageDataContent.indexOf(startMarker) + startMarker.length;
const endIndex = languageDataContent.lastIndexOf(endMarker);
const languageDataString = languageDataContent.substring(startIndex, endIndex);
const jsonString = '[' + languageDataString.replace(/(\w+):/g, '"$1":') + ']';
const languageData = JSON.parse(jsonString);

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
}

// Initialize Google Cloud Text-to-Speech client
const client = new textToSpeech.TextToSpeechClient();

// Language code mapping (simplified - in a real app, you'd have a more complete mapping)
const getLanguageCode = (countryCode) => {
    const languageMapping = {
        'US': 'en-US',     // English (US)
        'ES': 'es-ES',     // Spanish
        'FR': 'fr-FR',     // French
        'DE': 'de-DE',     // German
        'IT': 'it-IT',     // Italian
        'PT': 'pt-PT',     // Portuguese
        'RU': 'ru-RU',     // Russian
        'JP': 'ja-JP',     // Japanese
        'CN': 'cmn-CN',    // Mandarin Chinese
        'KR': 'ko-KR',     // Korean
        'SA': 'ar-XA',     // Arabic
        'IN': 'hi-IN',     // Hindi
        'TR': 'tr-TR',     // Turkish
        'NL': 'nl-NL',     // Dutch
        'SE': 'sv-SE',     // Swedish
        'PL': 'pl-PL',     // Polish
        'GR': 'el-GR',     // Greek
        'IL': 'he-IL',     // Hebrew
        'TH': 'th-TH',     // Thai
        'VN': 'vi-VN',     // Vietnamese
        'NO': 'nb-NO',     // Norwegian
        'FI': 'fi-FI',     // Finnish
        'DK': 'da-DK',     // Danish
        'CZ': 'cs-CZ',     // Czech
        'HU': 'hu-HU',     // Hungarian
        'RO': 'ro-RO',     // Romanian
        'BG': 'bg-BG',     // Bulgarian
        'HR': 'hr-HR',     // Croatian
        'UA': 'uk-UA',     // Ukrainian
        'PH': 'fil-PH',    // Filipino
        'ID': 'id-ID',     // Indonesian
        'MY': 'ms-MY',     // Malay
        'ZA': 'af-ZA',     // Afrikaans
        'ET': 'am-ET',     // Amharic
        'IR': 'fa-IR',     // Persian
        'PK': 'ur-PK',     // Urdu
        'BD': 'bn-BD',     // Bengali
        'NP': 'ne-NP',     // Nepali
        'LK': 'si-LK',     // Sinhalese
        'KH': 'km-KH',     // Khmer
        'MM': 'my-MM',     // Burmese
        'MN': 'mn-MN',     // Mongolian
        'KZ': 'kk-KZ',     // Kazakh
        'UZ': 'uz-UZ',     // Uzbek
        'AZ': 'az-AZ',     // Azerbaijani
        'GE': 'ka-GE',     // Georgian
        'AM': 'hy-AM',     // Armenian
        'AL': 'sq-AL',     // Albanian
        'LV': 'lv-LV',     // Latvian
        'LT': 'lt-LT',     // Lithuanian
        'EE': 'et-EE',     // Estonian
        'IS': 'is-IS',     // Icelandic
        'IE': 'ga-IE',     // Irish
        'MT': 'mt-MT',     // Maltese
        'LU': 'lb-LU',     // Luxembourgish
        'SK': 'sk-SK',     // Slovak
        'SI': 'sl-SI'      // Slovenian
    };
    
    return languageMapping[countryCode] || 'en-US'; // Default to US English if not found
};

// Function to generate audio for a single language
async function generateAudioForLanguage(language) {
    try {
        const languageCode = getLanguageCode(language.countryCode);
        const outputFile = path.join(audioDir, `${language.id}.mp3`);
        
        console.log(`Generating audio for ${language.languageName} (${languageCode}): "${language.phrase}"`);
        
        const request = {
            input: { text: language.phrase },
            voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };
        
        const [response] = await client.synthesizeSpeech(request);
        fs.writeFileSync(outputFile, response.audioContent, 'binary');
        console.log(`Audio saved to: ${outputFile}`);
        
        return true;
    } catch (error) {
        console.error(`Error generating audio for ${language.languageName}:`, error);
        return false;
    }
}

// Alternative function using browser's SpeechSynthesis API (for client-side generation)
function generateAudioWithBrowserSpeechSynthesis(language) {
    // This is a placeholder for client-side implementation
    // In a real app, you would use the Web Speech API in the browser
    console.log(`To generate audio for ${language.languageName} in the browser:`);
    console.log(`
    // Browser code:
    const utterance = new SpeechSynthesisUtterance("${language.phrase}");
    utterance.lang = "${getLanguageCode(language.countryCode)}";
    speechSynthesis.speak(utterance);
    `);
}

// Main function to generate all audio files
async function generateAllAudio() {
    console.log(`Starting audio generation for ${languageData.length} languages...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const language of languageData) {
        const success = await generateAudioForLanguage(language);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Audio generation complete!`);
    console.log(`Success: ${successCount}, Failed: ${failCount}`);
}

// Alternative implementations for other TTS services

// Amazon Polly implementation
function generateWithAmazonPolly() {
    console.log(`
    // Using Amazon Polly:
    const AWS = require('aws-sdk');
    const polly = new AWS.Polly({ region: 'us-west-2' });
    
    async function generateAudio(text, languageCode, outputFile) {
        const params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Joanna', // Choose appropriate voice for the language
            LanguageCode: languageCode
        };
        
        const data = await polly.synthesizeSpeech(params).promise();
        fs.writeFileSync(outputFile, data.AudioStream, 'binary');
        console.log(\`Audio saved to: \${outputFile}\`);
    }
    `);
}

// Microsoft Azure TTS implementation
function generateWithAzureTTS() {
    console.log(`
    // Using Microsoft Azure Speech Service:
    const sdk = require('microsoft-cognitiveservices-speech-sdk');
    
    async function generateAudio(text, languageCode, outputFile) {
        const speechConfig = sdk.SpeechConfig.fromSubscription('YOUR_SUBSCRIPTION_KEY', 'YOUR_REGION');
        speechConfig.speechSynthesisLanguage = languageCode;
        
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        
        synthesizer.speakTextAsync(
            text,
            result => {
                synthesizer.close();
                console.log(\`Audio saved to: \${outputFile}\`);
            },
            error => {
                console.error('Error:', error);
                synthesizer.close();
            }
        );
    }
    `);
}

// Run the main function if this script is executed directly
if (require.main === module) {
    // Check if Google Cloud credentials are set
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.');
        console.error('Please set up Google Cloud credentials before running this script.');
        console.error('See: https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries');
        process.exit(1);
    }
    
    generateAllAudio().catch(console.error);
}

module.exports = {
    generateAudioForLanguage,
    generateAllAudio
};
