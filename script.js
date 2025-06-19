// Global variables
let currentLanguage = null;
let audioPlaying = false;
const audioPlayer = document.getElementById('audio-player');

// DOM Elements
const mapViewBtn = document.getElementById('map-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const mapView = document.getElementById('map-view');
const listView = document.getElementById('list-view');
const worldMap = document.getElementById('world-map');
const languagesGrid = document.getElementById('languages-grid');
const languageModal = document.getElementById('language-modal');
const closeModal = document.querySelector('.close-modal');
const modalLanguageName = document.getElementById('modal-language-name');
const modalFlag = document.getElementById('modal-flag');
const modalPhrase = document.getElementById('modal-phrase');
const modalPronunciation = document.getElementById('modal-pronunciation');
const modalMeme = document.getElementById('modal-meme');
const modalFunFact = document.getElementById('modal-fun-fact');
const playAudioBtn = document.getElementById('play-audio');
const audioWave = document.querySelector('.audio-wave');
const randomLanguageBtn = document.getElementById('random-language-btn');
const shareBtn = document.getElementById('share-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    populateLanguageGrid();
    setupEventListeners();
    
    // Create placeholder audio files
    createPlaceholderAudio();
    
    // Create placeholder meme images
    createPlaceholderMemes();
});

// Initialize the world map using D3.js
function initMap() {
    const width = worldMap.clientWidth;
    const height = worldMap.clientHeight;
    
    // Create SVG element
    const svg = d3.select('#world-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a projection
    const projection = d3.geoMercator()
        .scale(width / 6.5)
        .translate([width / 2, height / 1.7]);
    
    // Create a path generator
    const path = d3.geoPath()
        .projection(projection);
    
    // Load world map data
    d3.json('https://unpkg.com/world-atlas@2/countries-110m.json')
        .then(data => {
            // Convert TopoJSON to GeoJSON
            const countries = topojson.feature(data, data.objects.countries).features;
            
            // Draw the countries
            svg.selectAll('path')
                .data(countries)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', d => {
                    // Check if we have data for this country
                    const countryCode = getCountryCode(d.id);
                    const language = languageData.find(lang => lang.countryCode === countryCode);
                    
                    // Check if this country has audio
                    let hasAudio = false;
                    if (language) {
                        // In a real app, we would check if the audio file exists
                        // For this demo, we'll assume all languages in our data have audio
                        hasAudio = true;
                    }
                    
                    return `country ${language ? 'has-data' : ''} ${hasAudio ? 'has-audio' : ''}`;
                })
                .attr('data-country-code', d => getCountryCode(d.id))
                .on('click', function(event, d) {
                    const countryCode = getCountryCode(d.id);
                    const language = languageData.find(lang => lang.countryCode === countryCode);
                    
                    if (language) {
                        openLanguageModal(language);
                    }
                });
        })
        .catch(error => {
            console.error('Error loading map data:', error);
            // Fallback to grid view if map fails to load
            switchView('list');
        });
}

// Helper function to convert numeric country IDs to ISO country codes
function getCountryCode(id) {
    // This is a simplified mapping function
    // In a real application, you would have a complete mapping of numeric IDs to ISO codes
    const countryMapping = {
        840: 'US', // United States
        724: 'ES', // Spain
        250: 'FR', // France
        276: 'DE', // Germany
        380: 'IT', // Italy
        620: 'PT', // Portugal
        643: 'RU', // Russia
        392: 'JP', // Japan
        156: 'CN', // China
        410: 'KR', // South Korea
        682: 'SA', // Saudi Arabia
        356: 'IN', // India
        792: 'TR', // Turkey
        528: 'NL', // Netherlands
        752: 'SE', // Sweden
        616: 'PL', // Poland
        300: 'GR', // Greece
        376: 'IL', // Israel
        764: 'TH', // Thailand
        704: 'VN', // Vietnam
        578: 'NO', // Norway
        246: 'FI', // Finland
        208: 'DK', // Denmark
        203: 'CZ', // Czech Republic
        348: 'HU', // Hungary
        642: 'RO', // Romania
        100: 'BG', // Bulgaria
        688: 'RS', // Serbia
        191: 'HR', // Croatia
        804: 'UA', // Ukraine
        608: 'PH', // Philippines
        360: 'ID', // Indonesia
        458: 'MY', // Malaysia
        404: 'KE', // Kenya
        710: 'ZA', // South Africa
        231: 'ET', // Ethiopia
        364: 'IR', // Iran
        586: 'PK', // Pakistan
        50: 'BD',  // Bangladesh
        524: 'NP', // Nepal
        144: 'LK', // Sri Lanka
        116: 'KH', // Cambodia
        104: 'MM', // Myanmar
        496: 'MN', // Mongolia
        398: 'KZ', // Kazakhstan
        860: 'UZ', // Uzbekistan
        31: 'AZ',  // Azerbaijan
        268: 'GE', // Georgia
        51: 'AM',  // Armenia
        8: 'AL',   // Albania
        428: 'LV', // Latvia
        440: 'LT', // Lithuania
        233: 'EE', // Estonia
        352: 'IS', // Iceland
        372: 'IE', // Ireland
        // Wales is part of the UK (826)
        826: 'GB', // United Kingdom
        // Basque and Catalan are in Spain (724)
        470: 'MT', // Malta
        442: 'LU', // Luxembourg
        703: 'SK', // Slovakia
        705: 'SI'  // Slovenia
    };
    
    return countryMapping[id] || 'Unknown';
}

// Populate the language grid with cards
function populateLanguageGrid() {
    languagesGrid.innerHTML = '';
    
    languageData.forEach((language, index) => {
        const card = document.createElement('div');
        card.className = 'language-card';
        card.setAttribute('data-language-id', language.id);
        card.style.animationDelay = `${(index % 10) * 0.1}s`;
        
        card.innerHTML = `
            <h3>
                <img class="flag" src="https://flagcdn.com/w40/${language.countryCode.toLowerCase()}.png" 
                     alt="${language.country} flag">
                ${language.languageName}
            </h3>
            <p class="phrase">${language.phrase}</p>
        `;
        
        card.addEventListener('click', () => {
            openLanguageModal(language);
        });
        
        languagesGrid.appendChild(card);
    });
}

// Open the language detail modal
function openLanguageModal(language) {
    currentLanguage = language;
    
    modalLanguageName.textContent = `${language.languageName} (${language.country})`;
    modalFlag.src = `https://flagcdn.com/w80/${language.countryCode.toLowerCase()}.png`;
    modalPhrase.textContent = language.phrase;
    modalPronunciation.textContent = `Pronunciation: ${language.pronunciation}`;
    
    // Set fun fact
    modalFunFact.textContent = language.funFact;
    
    // Set audio source
    audioPlayer.src = language.audioFile;
    
    // Reset audio wave animation
    audioWave.classList.remove('playing');
    
    // Show the modal
    languageModal.style.display = 'block';
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
}

// Close the language detail modal
function closeLanguageModal() {
    // Stop audio if playing
    if (audioPlaying) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlaying = false;
        audioWave.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    
    // Hide the modal
    languageModal.style.display = 'none';
    
    // Remove body class to allow scrolling
    document.body.classList.remove('modal-open');
    
    currentLanguage = null;
}

// Play audio for the current language
function playAudio() {
    if (!currentLanguage) return;
    
    if (audioPlaying) {
        // Stop audio
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlaying = false;
        audioWave.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    } else {
        // First try to play the audio file if it exists
        const audioFile = currentLanguage.audioFile;
        
        // Check if we're running from the server (not a file:// URL)
        const isServer = window.location.protocol !== 'file:';
        
        if (isServer) {
            // If we're running from the server, try to generate/get the audio
            fetch(`/api/generate-audio/${currentLanguage.id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (data.useBrowserSynthesis) {
                            // Use browser's speech synthesis
                            playWithSpeechSynthesis();
                        } else {
                            // Play the audio file from the server
                            audioPlayer.src = data.audioUrl;
                            audioPlayer.play()
                                .then(() => {
                                    audioPlaying = true;
                                    audioWave.classList.add('playing');
                                    playAudioBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                                })
                                .catch(error => {
                                    console.error('Error playing audio file:', error);
                                    // Fall back to speech synthesis
                                    playWithSpeechSynthesis();
                                });
                        }
                    } else {
                        console.error('Error generating audio:', data.message);
                        // Fall back to speech synthesis
                        playWithSpeechSynthesis();
                    }
                })
                .catch(error => {
                    console.error('Error fetching audio:', error);
                    // Fall back to speech synthesis
                    playWithSpeechSynthesis();
                });
        } else {
            // If we're running from a file:// URL, use speech synthesis directly
            playWithSpeechSynthesis();
        }
    }
}

// Play audio using the browser's Speech Synthesis API
function playWithSpeechSynthesis() {
    // Check if the browser supports speech synthesis
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        alert('Sorry, your browser does not support speech synthesis. Try using a modern browser like Chrome, Edge, or Safari.');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(currentLanguage.phrase);
    
    // Set the language based on the country code
    const languageCode = getLanguageCodeForSpeech(currentLanguage.countryCode);
    utterance.lang = languageCode;
    
    // Set up event handlers
    utterance.onstart = () => {
        audioPlaying = true;
        audioWave.classList.add('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    };
    
    utterance.onend = () => {
        audioPlaying = false;
        audioWave.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        audioPlaying = false;
        audioWave.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        alert('Sorry, there was an error playing the audio. Please try again.');
    };
    
    // Speak the phrase
    window.speechSynthesis.speak(utterance);
}

// Get the language code for speech synthesis based on country code
function getLanguageCodeForSpeech(countryCode) {
    // This is a simplified mapping - in a real app, you'd have a more complete mapping
    const languageMapping = {
        'US': 'en-US',     // English (US)
        'ES': 'es-ES',     // Spanish
        'FR': 'fr-FR',     // French
        'DE': 'de-DE',     // German
        'IT': 'it-IT',     // Italian
        'PT': 'pt-PT',     // Portuguese
        'RU': 'ru-RU',     // Russian
        'JP': 'ja-JP',     // Japanese
        'CN': 'zh-CN',     // Mandarin Chinese
        'KR': 'ko-KR',     // Korean
        'SA': 'ar-SA',     // Arabic
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
        'GB': 'en-GB',     // British English
        'MT': 'mt-MT',     // Maltese
        'LU': 'lb-LU',     // Luxembourgish
        'SK': 'sk-SK',     // Slovak
        'SI': 'sl-SI'      // Slovenian
    };
    
    return languageMapping[countryCode] || 'en-US'; // Default to US English if not found
}

// Show a random language
function showRandomLanguage() {
    const randomIndex = Math.floor(Math.random() * languageData.length);
    const randomLanguage = languageData[randomIndex];
    
    openLanguageModal(randomLanguage);
}

// Share the current language
function shareLanguage() {
    if (!currentLanguage) return;
    
    // Create share text
    const shareText = `Learn how to say "F*ck You" in ${currentLanguage.languageName}: "${currentLanguage.phrase}" (${currentLanguage.pronunciation})`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'How to Say F*ck You Around the World',
            text: shareText,
            url: window.location.href
        })
        .catch(error => {
            console.error('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method (copy to clipboard)
function fallbackShare(text) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    document.execCommand('copy');
    
    // Remove the textarea
    document.body.removeChild(textarea);
    
    // Show a confirmation message
    alert('Copied to clipboard! Now you can paste it anywhere to share.');
}

// Switch between map and list views
function switchView(viewType) {
    if (viewType === 'map') {
        mapView.classList.add('active');
        listView.classList.remove('active');
        mapViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        mapView.classList.remove('active');
        listView.classList.add('active');
        mapViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
    }
}

// Search for languages
function searchLanguages() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // If search is empty, show all languages
        document.querySelectorAll('.language-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Filter languages based on search term
    document.querySelectorAll('.language-card').forEach(card => {
        const languageId = card.getAttribute('data-language-id');
        const language = languageData.find(lang => lang.id === languageId);
        
        if (language) {
            const matchesSearch = 
                language.languageName.toLowerCase().includes(searchTerm) ||
                language.country.toLowerCase().includes(searchTerm) ||
                language.phrase.toLowerCase().includes(searchTerm);
            
            card.style.display = matchesSearch ? 'block' : 'none';
        }
    });
    
    // Switch to list view if searching
    switchView('list');
}

// Set up event listeners
function setupEventListeners() {
    // View toggle buttons
    mapViewBtn.addEventListener('click', () => switchView('map'));
    listViewBtn.addEventListener('click', () => switchView('list'));
    
    // Modal close button
    closeModal.addEventListener('click', closeLanguageModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === languageModal) {
            closeLanguageModal();
        }
    });
    
    // Play audio button
    playAudioBtn.addEventListener('click', playAudio);
    
    // Audio ended event
    audioPlayer.addEventListener('ended', () => {
        audioPlaying = false;
        audioWave.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    });
    
    // Random language button
    randomLanguageBtn.addEventListener('click', showRandomLanguage);
    
    // Share button
    shareBtn.addEventListener('click', shareLanguage);
    
    // Search functionality
    searchBtn.addEventListener('click', searchLanguages);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchLanguages();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && languageModal.style.display === 'block') {
            closeLanguageModal();
        }
    });
}

// Create placeholder audio files (in a real app, you would have actual audio files)
function createPlaceholderAudio() {
    // This function would normally create or ensure audio files exist
    // For this demo, we'll just log a message
    console.log('Audio placeholders would be created here in a real application');
    
    // In a real application, you would:
    // 1. Check if audio files exist
    // 2. If not, generate them using text-to-speech APIs
    // 3. Save them to the audio directory
}

// Create placeholder meme images (in a real app, you would have actual images)
function createPlaceholderMemes() {
    // This function would normally create or ensure meme images exist
    // For this demo, we'll just log a message
    console.log('Meme image placeholders would be created here in a real application');
    
    // In a real application, you would:
    // 1. Check if meme images exist
    // 2. If not, generate them or use placeholder images
    // 3. Save them to the images directory
}

// Add topojson-client for map rendering (normally this would be included as a separate script)
// This is a simplified version of the library for demo purposes
const topojson = {
    feature: function(topology, object) {
        return {
            type: "FeatureCollection",
            features: object.geometries.map(function(geometry) {
                return {
                    type: "Feature",
                    properties: geometry.properties,
                    geometry: {
                        type: geometry.type,
                        coordinates: geometry.coordinates
                    },
                    id: geometry.id
                };
            })
        };
    }
};
