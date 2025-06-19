# How to Say "F*ck You" Around the World

A meme-tastic journey through 70 languages of insult! This funny website showcases how to say "f*ck you" in different languages from around the world, complete with audio pronunciations and meme-based humor.

## Features

- **Interactive World Map**: Click on countries to see their language's version of "f*ck you"
- **Grid/List View**: Browse all 70 languages in a searchable grid
- **Audio Pronunciations**: Hear how each phrase sounds in its native language
- **Meme Content**: Each language comes with a relevant meme for extra humor
- **Fun Facts**: Learn interesting tidbits about each language's profanity
- **Responsive Design**: Works on desktop and mobile devices
- **Share Functionality**: Share your favorite insults with friends

## Technologies Used

- HTML5, CSS3, JavaScript
- Node.js with Express for the backend
- D3.js for the interactive world map
- Font Awesome for icons
- Responsive design with CSS Grid and Flexbox

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/funny-languages-website.git
   cd funny-languages-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

To run the server in development mode with auto-restart:
```
npm run dev
```

## Project Structure

```
funny-languages-website/
├── index.html          # Main webpage
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── data.js             # Language data
├── server.js           # Node.js server
├── package.json        # Project dependencies
├── audio/              # Directory for audio recordings
└── images/             # Directory for meme images
```

## Adding New Languages

To add a new language:

1. Edit `data.js` and add a new entry to the `languageData` array
2. Add the corresponding audio file to the `audio/` directory
3. Add a meme image to the `images/` directory

## Disclaimer

This website is created for educational and humorous purposes only. No offense is intended to any culture or language group. The content is meant to be taken in a light-hearted manner.

## License

MIT License - See LICENSE file for details.
