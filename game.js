// Mini Metro Clone Game
class MiniMetroGame {
    constructor() {
        // Game state
        this.currentCityIndex = 0;
        this.cities = [];
        this.selectedLine = null;
        this.selectedStation = null;
        this.dragStart = null;
        this.dragEnd = null;
        this.totalPassengers = 0;
        this.gameStarted = false;
        this.tutorialShown = false;
        this.isPaused = false;
        this.maxPassengersPerPickup = 50; // Maximum passengers a train can pick up at once
        
        // Time and resource management
        this.gameTime = 0; // Time in seconds
        this.dayLength = 24; // 24 seconds per day (1 second = 1 hour)
        this.weekLength = 7 * this.dayLength; // Week length in seconds (168 seconds = ~3 minutes)
        this.lastRewardTime = 0;
        this.resources = {
            locomotives: 5,
            carriages: 10, // Start with 10 carriages (2 per locomotive)
            lines: 3
        };
        
        // Train behavior
        this.trainSpeed = 0.01;
        this.stationStopTime = 1.0;
        this.baseTrainCapacity = 25; // Base capacity for locomotive
        this.carriageCapacity = 25; // Each carriage adds 25 capacity
        
        // City data
        this.cityData = [
            {
                name: 'Vancouver',
                color: '#0046AD', // SkyTrain color
                stationPrefix: 'Van-',
                description: 'Vancouver\'s SkyTrain is one of the oldest and longest automated metro systems in the world. Connect stations efficiently to handle the Pacific Northwest commuters.'
            },
            {
                name: 'Toronto',
                color: '#EE3224', // TTC color
                stationPrefix: 'TOR-',
                description: 'Toronto\'s TTC subway system serves Canada\'s largest city. Build your network to handle the high volume of passengers in this bustling metropolis.'
            },
            {
                name: 'Montreal',
                color: '#0072CE', // STM color
                stationPrefix: 'MTL-',
                description: 'Montreal\'s Metro is known for its distinctive station architecture. Create an efficient network to connect the French-Canadian city\'s diverse neighborhoods.'
            },
            {
                name: 'Alberta',
                color: '#B72E04', // Calgary CTrain color
                stationPrefix: 'ALB-',
                description: 'Alberta\'s CTrain serves Calgary with a mix of street-level and dedicated routes. Design your system to handle the growing population of this western province.'
            },
            {
                name: 'Seoul',
                color: '#00A84D', // Seoul Line 2 color
                stationPrefix: 'SEO-',
                description: 'Seoul\'s subway is one of the busiest and most efficient systems in the world. Can you handle the massive passenger volume of South Korea\'s capital?'
            },
            {
                name: 'Pusan',
                color: '#F06A00', // Busan Line 1 color
                stationPrefix: 'PUS-',
                description: 'Busan\'s metro serves South Korea\'s second-largest city. Connect the coastal areas and handle the unique geography of this port city.'
            },
            {
                name: 'Hong Kong',
                color: '#E60012', // MTR color
                stationPrefix: 'HKG-',
                description: 'Hong Kong\'s MTR is renowned for its efficiency and cleanliness. Build a network to serve the dense urban environment of this global financial hub.'
            },
            {
                name: 'Beijing',
                color: '#C23A30', // Beijing Subway color
                stationPrefix: 'BEI-',
                description: 'Beijing\'s subway is the world\'s busiest metro system by annual ridership. Create a network to serve China\'s sprawling capital city.'
            },
            {
                name: 'Shanghai',
                color: '#E40034', // Shanghai Metro color
                stationPrefix: 'SHA-',
                description: 'Shanghai\'s metro is one of the fastest-growing transit systems. Connect the modern financial district with the historic areas of China\'s largest city.'
            },
            {
                name: 'Shenzhen',
                color: '#009943', // Shenzhen Metro color
                stationPrefix: 'SHZ-',
                description: 'Shenzhen\'s metro serves China\'s technology hub. Build an efficient network for this young, rapidly expanding city on the border with Hong Kong.'
            }
        ];
        
        this.lineColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        this.stationShapes = ['circle', 'square', 'triangle', 'diamond', 'pentagon'];
        
        // Station spawning
        this.stationSpawnInterval = 15000; // New station every 15 seconds
        this.lastStationSpawnTime = Date.now();
        this.maxStations = 15; // Maximum number of stations
        
        // For tracking frames
        this.frameCount = 0;
        
        // Passenger satisfaction
        this.satisfaction = 100; // Start at 100%
        this.satisfactionDecayRate = 0.01; // How fast satisfaction decreases when stations are overcrowded
        
        // Initialize the start screen
        this.setupStartScreen();
    }
    
    setupStartScreen() {
        // Add tutorial button at the top of the page
        const startScreenHeader = document.createElement('div');
        startScreenHeader.className = 'start-screen-header';
        
        const gameTitle = document.createElement('h1');
        gameTitle.textContent = 'Mini Metro Clone';
        
        const tutorialButton = document.createElement('button');
        tutorialButton.id = 'tutorial-button';
        tutorialButton.className = 'menu-button primary-button';
        tutorialButton.textContent = 'How to Play';
        tutorialButton.addEventListener('click', () => {
            this.startTutorialWorld();
        });
        
        startScreenHeader.appendChild(gameTitle);
        startScreenHeader.appendChild(tutorialButton);
        
        // Insert at the beginning of start-screen
        const startScreen = document.getElementById('start-screen');
        startScreen.insertBefore(startScreenHeader, startScreen.firstChild);
        
        const cityGrid = document.getElementById('city-grid');
        cityGrid.innerHTML = ''; // Clear any existing content
        
        // Create city selection buttons
        this.cityData.forEach((city, index) => {
            const cityButton = document.createElement('div');
            cityButton.className = 'city-button';
            cityButton.dataset.cityIndex = index;
            
            const cityIcon = document.createElement('div');
            cityIcon.className = 'city-icon';
            cityIcon.style.backgroundColor = city.color;
            cityIcon.textContent = city.name.charAt(0);
            
            const cityName = document.createElement('div');
            cityName.className = 'city-name';
            cityName.textContent = city.name;
            
            const cityDesc = document.createElement('div');
            cityDesc.className = 'city-description';
            cityDesc.textContent = city.description;
            
            cityButton.appendChild(cityIcon);
            cityButton.appendChild(cityName);
            cityButton.appendChild(cityDesc);
            cityGrid.appendChild(cityButton);
            
            // Add click event to start game with selected city
            cityButton.addEventListener('click', () => {
                this.startGame(index);
            });
        });
    }
    
    startTutorialWorld() {
        // Hide start screen and show game
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // Initialize the game in tutorial mode
        this.gameStarted = true;
        this.isTutorialMode = true;
        
        // Initialize the game
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Create a special tutorial city
        this.currentCityIndex = -1; // Special index for tutorial
        
        const tutorialCity = {
            id: -1,
            name: 'Tutorial City',
            color: '#4A90E2',
            stationPrefix: 'TUT-',
                stations: [],
                lines: [],
                trains: [],
                passengers: 0,
            active: true
        };
        
        // Add 3 stations in a triangle formation
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        tutorialCity.stations.push({
            id: 0,
            x: centerX,
            y: centerY - 100,
            shape: 'circle',
            passengers: 0,
            connections: []
        });
        
        tutorialCity.stations.push({
            id: 1,
            x: centerX - 100,
            y: centerY + 50,
            shape: 'square',
            passengers: 0,
            connections: []
        });
        
        tutorialCity.stations.push({
            id: 2,
            x: centerX + 100,
            y: centerY + 50,
            shape: 'triangle',
            passengers: 0,
            connections: []
        });
            
            // Create initial line
        tutorialCity.lines.push({
                id: 0,
                color: this.lineColors[0],
                stations: [],
                trains: []
            });
            
        this.cities = [tutorialCity];
        
        this.setupEventListeners();
        this.startTutorialSequence();
        this.gameLoop();
    }
    
    startTutorialSequence() {
        // Create tutorial steps
        const tutorialSteps = [
            {
                title: "Welcome to Mini Metro!",
                content: "This tutorial will teach you the basics of building a subway network. Let's get started!",
                highlight: null
            },
            {
                title: "Connecting Stations",
                content: "Click and drag from one station to another to create a subway line. Try connecting the circle station to the square station.",
                highlight: "stations",
                action: "connect",
                from: 0,
                to: 1
            },
            {
                title: "Adding a Train",
                content: "Great! Now let's add a train to your line. Click the 'Add Train' button at the bottom of the screen.",
                highlight: "add-train",
                action: "click-button"
            },
            {
                title: "Passengers",
                content: "Passengers will appear at stations and want to travel to other stations. Trains will automatically pick them up and drop them off.",
                highlight: null,
                action: "spawn-passengers"
            },
            {
                title: "Adding Another Line",
                content: "You can create multiple lines. Click the 'Add Line' button to create a new line, then connect the circle station to the triangle station.",
                highlight: "add-line",
                action: "add-line"
            },
            {
                title: "Congratulations!",
                content: "You've learned the basics of Mini Metro! Now you're ready to build subway networks in real cities. Return to the menu to start playing.",
                highlight: null,
                action: "complete"
            }
        ];
        
        this.tutorialSteps = tutorialSteps;
        this.currentTutorialStep = 0;
        
        this.showTutorialStep(this.currentTutorialStep);
    }
    
    showTutorialStep(stepIndex) {
        const step = this.tutorialSteps[stepIndex];
        
        // Remove any existing tutorial overlay
        const existingOverlay = document.getElementById('tutorial-step-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
        
        // Create tutorial step overlay
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.id = 'tutorial-step-overlay';
        tutorialOverlay.className = 'tutorial-overlay';
        
        const tutorialContent = document.createElement('div');
        tutorialContent.className = 'tutorial-content';
        
        const tutorialTitle = document.createElement('h3');
        tutorialTitle.textContent = step.title;
        
        const tutorialText = document.createElement('p');
        tutorialText.textContent = step.content;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'tutorial-buttons';
        
        // Only show back button if not on first step
        if (stepIndex > 0) {
            const backButton = document.createElement('button');
            backButton.textContent = 'Back';
            backButton.addEventListener('click', () => {
                this.currentTutorialStep--;
                this.showTutorialStep(this.currentTutorialStep);
            });
            buttonContainer.appendChild(backButton);
        }
        
        // Show next button or finish button
        if (stepIndex < this.tutorialSteps.length - 1) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                this.currentTutorialStep++;
                this.showTutorialStep(this.currentTutorialStep);
            });
            buttonContainer.appendChild(nextButton);
        } else {
            const finishButton = document.createElement('button');
            finishButton.textContent = 'Finish Tutorial';
            finishButton.addEventListener('click', () => {
                this.returnToStartScreen();
            });
            buttonContainer.appendChild(finishButton);
        }
        
        tutorialContent.appendChild(tutorialTitle);
        tutorialContent.appendChild(tutorialText);
        tutorialContent.appendChild(buttonContainer);
        tutorialOverlay.appendChild(tutorialContent);
        
        document.body.appendChild(tutorialOverlay);
        
        // Handle highlighting elements
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
        
        // Handle actions
        if (step.action) {
            this.handleTutorialAction(step);
        }
    }
    
    highlightElement(elementId) {
        // Remove any existing highlights
        const existingHighlights = document.querySelectorAll('.tutorial-highlight');
        existingHighlights.forEach(el => el.classList.remove('tutorial-highlight'));
        
        if (elementId === 'stations') {
            // Highlight all stations in the tutorial
            // This will be handled in the render method
            this.highlightStations = true;
        } else {
            // Highlight a specific button
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('tutorial-highlight');
            }
            this.highlightStations = false;
        }
    }
    
    handleTutorialAction(step) {
        const city = this.cities[0]; // Tutorial city
        
        switch (step.action) {
            case 'connect':
                // We'll check for this connection in the handleMouseUp method
                this.tutorialConnectionFrom = step.from;
                this.tutorialConnectionTo = step.to;
                break;
                
            case 'spawn-passengers':
                // Add passengers to stations
                city.stations[0].passengers = 2;
                city.stations[1].passengers = 1;
                city.passengers = 3;
                this.totalPassengers = 3;
                document.getElementById('passenger-count').textContent = this.totalPassengers;
                break;
                
            case 'add-line':
                // We'll check for this in the event listener for add-line button
                this.tutorialAddLine = true;
                break;
                
            case 'complete':
                // Nothing special needed here
                break;
        }
    }
    
    // Override handleMouseUp for tutorial
    handleMouseUp(e) {
        if (this.isTutorialMode) {
            const city = this.cities[0]; // Tutorial city
            
            if (this.selectedStation && this.dragEnd && 
                this.tutorialConnectionFrom !== undefined && 
                this.tutorialConnectionTo !== undefined) {
                
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if dragged to the correct station
                const targetStation = city.stations[this.tutorialConnectionTo];
                const distance = Math.sqrt((x - targetStation.x) ** 2 + (y - targetStation.y) ** 2);
                
                if (distance < 20 && this.selectedStation.id === this.tutorialConnectionFrom) {
                    // Correct connection made - add to the first line
                    this.connectStations(city, this.selectedStation.id, targetStation.id, 0);
                    
                    // Move to next tutorial step
                    setTimeout(() => {
                        this.currentTutorialStep++;
                        this.showTutorialStep(this.currentTutorialStep);
                        this.tutorialConnectionFrom = undefined;
                        this.tutorialConnectionTo = undefined;
                    }, 500);
                }
            }
            
            this.selectedStation = null;
            this.selectedLine = null;
            this.dragStart = null;
            this.dragEnd = null;
            return;
        }
        
        // Original handleMouseUp code for non-tutorial mode
        const city = this.cities[this.currentCityIndex];
        
        if (this.selectedStation && this.dragEnd) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if dragged to another station
            for (const station of city.stations) {
                if (station.id !== this.selectedStation.id) {
                    const distance = Math.sqrt((x - station.x) ** 2 + (y - station.y) ** 2);
                    if (distance < 20) {
                        // Find the first line with no stations or select a random line
                        let selectedLineId = 0;
                        const emptyLines = city.lines.filter(line => line.stations.length === 0);
                        
                        if (emptyLines.length > 0) {
                            selectedLineId = emptyLines[0].id;
                        } else if (this.selectedLine) {
                            selectedLineId = this.selectedLine.id;
                        }
                        
                        // Add connection between stations
                        this.connectStations(city, this.selectedStation.id, station.id, selectedLineId);
                        break;
                    }
                }
            }
        }
        
        this.selectedStation = null;
        this.selectedLine = null;
        this.dragStart = null;
        this.dragEnd = null;
    }
    
    // Override setupEventListeners for tutorial
    setupEventListeners() {
        // Add event listeners for canvas interactions
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Add event listeners for buttons - check if they exist first
        const addTrainButton = document.getElementById('add-train');
        if (addTrainButton) {
            addTrainButton.addEventListener('click', () => {
                if (this.isTutorialMode && this.currentTutorialStep === 2) {
                    const city = this.cities[0];
                    
                    // Make sure the line has stations connected before adding a train
                    if (city.lines[0].stations.length < 2) {
                        // Connect stations 0 and 1 if not already connected
                        if (!city.lines[0].stations.includes(0) || !city.lines[0].stations.includes(1)) {
                            this.connectStations(city, 0, 1, 0);
                        }
                    }
                    
                    this.addTrain(0, 0);
                    
                    // Move to next tutorial step
                    setTimeout(() => {
                        this.currentTutorialStep++;
                        this.showTutorialStep(this.currentTutorialStep);
                    }, 500);
                    
                    // Update the line info panel after adding a train
                    this.updateLineInfoPanel();
                    
                    return;
                }
                
                // Just add a train to a random line
                this.addTrain(this.currentCityIndex);
            });
        }
        
        const addLineButton = document.getElementById('add-line');
        if (addLineButton) {
            addLineButton.addEventListener('click', () => {
                if (this.isTutorialMode && this.tutorialAddLine) {
                    this.addLine(0);
                    this.tutorialAddLine = false;
                    
                    // Set up the next connection task
                    this.tutorialConnectionFrom = 0;
                    this.tutorialConnectionTo = 2;
                    return;
                }
                
                // Original code for non-tutorial mode
                const city = this.cities[this.currentCityIndex];
                if (city.lines.length < this.lineColors.length) {
                    this.addLine(this.currentCityIndex);
                }
            });
        }
        
        // Back to menu button
        const backToMenuButton = document.getElementById('back-to-menu');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
            this.returnToStartScreen();
        });
        }
        
        // Help button
        const helpButton = document.getElementById('help-button');
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.showInGameTutorial();
            });
        }
        
        // Add carriage button - create it if it doesn't exist
        let addCarriageButton = document.getElementById('add-carriage');
        if (!addCarriageButton) {
            // Create the button if it doesn't exist
            addCarriageButton = document.createElement('button');
            addCarriageButton.id = 'add-carriage';
            addCarriageButton.textContent = 'Add Carriage';
            
            // Add it to game controls
            const gameControls = document.getElementById('game-controls');
            if (gameControls) {
                // Insert after add-train button
                const addTrainButton = document.getElementById('add-train');
                if (addTrainButton && addTrainButton.parentNode) {
                    addTrainButton.parentNode.insertBefore(addCarriageButton, addTrainButton.nextSibling);
                } else {
                    gameControls.appendChild(addCarriageButton);
                }
            }
        }
        
        // Now add the event listener
        if (addCarriageButton) {
            addCarriageButton.addEventListener('click', () => {
                if (this.isTutorialMode) return;
                
                const city = this.cities[this.currentCityIndex];
                if (city.trains.length > 0 && this.resources.carriages > 0) {
                    // Add carriage to the first train for simplicity
                    this.addCarriage(this.currentCityIndex, city.trains[0].id);
                } else {
                    this.showNotification('No trains available or no carriages left!');
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Pause button
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                if (!this.isPaused) {
                    this.pauseGame();
                }
            });
        }
    }
    
    returnToStartScreen() {
        // Stop the game loop
        this.gameStarted = false;
        this.isTutorialMode = false;
        
        // Remove any tutorial overlays that might still be present
        const tutorialOverlays = document.querySelectorAll('.tutorial-overlay, .overlay');
        tutorialOverlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        
        // Show start screen and hide game
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        
        // Reset game state
        this.cities = [];
        this.selectedLine = null;
        this.selectedStation = null;
        this.dragStart = null;
        this.dragEnd = null;
        this.totalPassengers = 0;
        this.tutorialConnectionFrom = undefined;
        this.tutorialConnectionTo = undefined;
        this.tutorialAddLine = false;
        this.highlightStations = false;
        
        // Update passenger count display
        document.getElementById('passenger-count').textContent = '0';
    }
    
    updateActiveCity() {
        // Deactivate all cities
        this.cities.forEach(city => {
            city.active = false;
        });
        
        // Activate selected city
        this.cities[this.currentCityIndex].active = true;
    }
    
    addLine(cityIndex) {
        // Check if we have available lines
        if (this.resources.lines <= 0 && !this.isTutorialMode) {
            this.showNotification('No available lines! Wait for weekly rewards.');
            return;
        }
        
        const city = this.cities[cityIndex];
        const colorIndex = city.lines.length % this.lineColors.length;
        city.lines.push({
            id: city.lines.length,
            color: this.lineColors[colorIndex],
            stations: [],
            trains: []
        });
        
        // Decrease available lines
        if (!this.isTutorialMode) {
            this.resources.lines--;
            this.updateResourceDisplay();
        }
    }
    
    addTrain(cityIndex, lineIndex = null) {
        // Check if we have available locomotives
        if (this.resources.locomotives <= 0 && !this.isTutorialMode) {
            this.showNotification('No available locomotives! Wait for weekly rewards.');
            return;
        }
        
        const city = this.cities[cityIndex];
        
        // If lineIndex is not provided, pick a random line
        if (lineIndex === null) {
            if (city.lines.length > 0) {
                lineIndex = Math.floor(Math.random() * city.lines.length);
            } else {
                this.showNotification('No lines available!');
                return;
            }
        }
        
        const line = city.lines[lineIndex];
        
        if (!line || line.stations.length < 2) {
            this.showNotification('This line needs at least 2 connected stations!');
            return;
        }
        
        const train = {
            id: city.trains.length,
            lineId: lineIndex,
            stationIndex: 0,
            nextStationIndex: 1,
            progress: 0,
            speed: this.trainSpeed,
            capacity: this.baseTrainCapacity, // Use the base capacity from constructor
            carriages: [], // Array of carriage objects instead of just a count
            passengers: 0,
            direction: 1,
            // Store position history for carriages to follow
            positionHistory: [],
            // Station stop properties
            stoppedAt: 'current', // Start stopped at the first station
            stopTime: this.stationStopTime,
            reachedDestination: false,
            hasCollectedPassengers: false // Track if passengers were collected at this stop
        };
        
        // Add initial carriages (2 per locomotive)
        for (let i = 0; i < 2; i++) {
            train.carriages.push({
                id: i,
                progress: 0,
                // Each carriage follows at a closer distance
                followDistance: (i + 1) * 0.1, // Reduced from 0.2 to 0.1
                capacity: this.carriageCapacity, // Use the carriage capacity from constructor
                passengers: 0,
                // Store position for drawing
                x: 0,
                y: 0,
                angle: 0
            });
        }
        
        // Update total train capacity to include carriages
        train.capacity += train.carriages.length * this.carriageCapacity;
        
        // Initialize position history with starting station
        const startStation = city.stations[line.stations[0]] || city.stations[0];
        if (startStation) {
            train.positionHistory.push({
                x: startStation.x,
                y: startStation.y,
                angle: 0
            });
        }
        
        line.trains.push(train);
        city.trains.push(train);
        
        // Decrease available locomotives and carriages
        if (!this.isTutorialMode) {
            this.resources.locomotives -= 1; // Only decrease by 1
            this.resources.carriages -= 2; // Each locomotive uses 2 carriages
            this.updateResourceDisplay();
        }
        
        // Update the line info panel to show the new train count
        this.updateLineInfoPanel();
        
        return train; // Return the created train
    }
    
    handleMouseDown(e) {
        // Check if cities array is empty or index is invalid
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        // Make sure city exists before proceeding
        if (!city) {
            console.error('City not found:', this.currentCityIndex);
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on a station
        for (const station of city.stations) {
            const distance = Math.sqrt((x - station.x) ** 2 + (y - station.y) ** 2);
            if (distance < 20) {
                this.selectedStation = station;
                this.dragStart = { x: station.x, y: station.y };
                return;
            }
        }
        
        // Check if clicked on a line
        for (const line of city.lines) {
            for (let i = 0; i < line.stations.length - 1; i++) {
                const start = city.stations[line.stations[i]];
                const end = city.stations[line.stations[i + 1]];
                
                // Check if click is near the line
                const distance = this.distanceToLine(x, y, start.x, start.y, end.x, end.y);
                if (distance < 10) {
                    this.selectedLine = line;
                    return;
                }
            }
        }
    }
    
    handleMouseMove(e) {
        if (this.selectedStation) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.dragEnd = { x, y };
        }
    }
    
    connectStations(city, stationId1, stationId2, lineId) {
        const line = city.lines[lineId];
        
        // Check if stations are already connected on this line
        if (line.stations.includes(stationId1) && line.stations.includes(stationId2)) {
            return;
        }
        
        // If the line is empty, add both stations
        if (line.stations.length === 0) {
            line.stations.push(stationId1, stationId2);
        } 
        // If the first station is already in the line
        else if (line.stations.includes(stationId1)) {
            if (line.stations[0] === stationId1) {
                line.stations.unshift(stationId2);
            } else if (line.stations[line.stations.length - 1] === stationId1) {
                line.stations.push(stationId2);
            }
        } 
        // If the second station is already in the line
        else if (line.stations.includes(stationId2)) {
            if (line.stations[0] === stationId2) {
                line.stations.unshift(stationId1);
            } else if (line.stations[line.stations.length - 1] === stationId2) {
                line.stations.push(stationId1);
            }
        }
        
        // Update station connections
        const station1 = city.stations[stationId1];
        const station2 = city.stations[stationId2];
        
        if (!station1.connections.includes(stationId2)) {
            station1.connections.push(stationId2);
        }
        
        if (!station2.connections.includes(stationId1)) {
            station2.connections.push(stationId1);
        }
        
        // Update the line info panel
        this.updateLineInfoPanel();
    }
    
    distanceToLine(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    generatePassengers() {
        if (this.isTutorialMode) return;
        
        // Only generate passengers for the active city
        const city = this.cities[this.currentCityIndex];
        
        // Randomly generate passengers at stations
        if (Math.random() < 0.05) { // Increased chance from 0.02 to 0.05
            // Pick a random number of passengers to generate (1-3)
            const passengerCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < passengerCount; i++) {
            const sourceStation = city.stations[Math.floor(Math.random() * city.stations.length)];
            let destStation;
            
            do {
                destStation = city.stations[Math.floor(Math.random() * city.stations.length)];
            } while (destStation.id === sourceStation.id);
            
            sourceStation.passengers++;
            city.passengers++;
            this.totalPassengers++;
            }
            
            // Update passenger count display
            document.getElementById('passenger-count').textContent = this.totalPassengers;
        }
    }
    
    updateTrains() {
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
        for (const train of city.trains) {
            const line = city.lines[train.lineId];
            
            if (line.stations.length < 2) continue;
            
            const currentStationId = line.stations[train.stationIndex];
            const nextStationId = line.stations[train.nextStationIndex];
            
            const currentStation = city.stations[currentStationId];
            const nextStation = city.stations[nextStationId];
            
            // Check if train is stopped at a station
            if (train.stoppedAt !== undefined) {
                // Update stop timer
                train.stopTime -= 1/60; // Assuming 60 FPS
                
                // If stop time is over, continue moving
                if (train.stopTime <= 0) {
                    train.stoppedAt = undefined;
                    train.stopTime = 0;
                    
                    // If we were at the destination station, update to next station
                    if (train.reachedDestination) {
                train.progress = 0;
                train.stationIndex = train.nextStationIndex;
                
                        // Determine next station - fixed to properly move through all stations
                        if (train.direction === undefined) {
                            train.direction = 1; // Initialize direction (forward)
                        }
                        
                        // Update next station based on current direction
                        train.nextStationIndex = train.stationIndex + train.direction;
                        
                        // If we've reached the end of the line, reverse direction
                        if (train.nextStationIndex >= line.stations.length || train.nextStationIndex < 0) {
                            train.direction *= -1; // Reverse direction
                            train.nextStationIndex = train.stationIndex + train.direction;
                        }
                        
                        train.reachedDestination = false;
                    }
                } else if (!train.hasCollectedPassengers && train.stopTime <= this.stationStopTime / 2) {
                    // Collect passengers halfway through the stop
                    // This ensures we only collect passengers once per stop
                    
                    const station = train.stoppedAt === 'current' ? currentStation : nextStation;
                    
                    // Pick up passengers - collect as many as possible up to train capacity and max per pickup
                    if (station.passengers > 0 && train.passengers < train.capacity) {
                        const spaceAvailable = train.capacity - train.passengers;
                        const passengersToPickUp = Math.min(
                            station.passengers, 
                            spaceAvailable,
                            this.maxPassengersPerPickup // Limit to max passengers per pickup
                        );
                        station.passengers -= passengersToPickUp;
                    train.passengers += passengersToPickUp;
                }
                
                    // Drop off passengers - randomly drop off some passengers
                if (train.passengers > 0) {
                        // Drop off up to half of the passengers on the train
                        const maxDropOff = Math.ceil(train.passengers / 2);
                        const passengersToDropOff = Math.floor(Math.random() * maxDropOff) + 1;
                        
                    train.passengers -= passengersToDropOff;
                    city.passengers -= passengersToDropOff;
                    this.totalPassengers -= passengersToDropOff;
                    
                    // Update passenger count display
                    document.getElementById('passenger-count').textContent = this.totalPassengers;
                }
                
                    train.hasCollectedPassengers = true;
                }
                
                // Train is still stopped, update carriage positions to match the stopped train
                const stoppedX = train.stoppedAt === 'current' ? currentStation.x : nextStation.x;
                const stoppedY = train.stoppedAt === 'current' ? currentStation.y : nextStation.y;
                
                // Add the stopped position to history
                train.positionHistory.unshift({
                    x: stoppedX,
                    y: stoppedY,
                    angle: train.positionHistory.length > 0 ? train.positionHistory[0].angle : 0
                });
                
                // Limit history size
                if (train.positionHistory.length > 100) {
                    train.positionHistory.pop();
                }
                
                // Update carriages while stopped
                let lastX = stoppedX;
                let lastY = stoppedY;
                
                for (const carriage of train.carriages) {
                    // Calculate how far back in history to look based on follow distance
                    const historyIndex = Math.min(
                        Math.floor(carriage.followDistance / train.speed),
                        train.positionHistory.length - 1
                    );
                    
                    // If we have enough history, use it
                    if (historyIndex < train.positionHistory.length) {
                        const historyPoint = train.positionHistory[historyIndex];
                        carriage.x = historyPoint.x;
                        carriage.y = historyPoint.y;
                        carriage.angle = historyPoint.angle;
                    }
                    
                    // Check if this carriage is too far from the previous one
                    const distanceFromPrevious = Math.sqrt(
                        Math.pow(carriage.x - lastX, 2) + 
                        Math.pow(carriage.y - lastY, 2)
                    );
                    
                    // If too far, adjust position to be closer
                    const maxDistance = 40; // Maximum allowed distance between carriages
                    if (distanceFromPrevious > maxDistance) {
                        // Calculate direction vector from this carriage to the previous one
                        const dx = lastX - carriage.x;
                        const dy = lastY - carriage.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        
                        // Normalize and scale to max distance
                        const ndx = dx / length;
                        const ndy = dy / length;
                        
                        // Position carriage at max distance from previous
                        carriage.x = lastX - ndx * maxDistance;
                        carriage.y = lastY - ndy * maxDistance;
                    }
                    
                    // Update last position for next carriage
                    lastX = carriage.x;
                    lastY = carriage.y;
                }
                
                if (train.stoppedAt !== undefined) {
                    continue; // Skip the rest of the update for this train
                }
            }
            
            // Store previous position
            const prevX = currentStation.x + (nextStation.x - currentStation.x) * train.progress;
            const prevY = currentStation.y + (nextStation.y - currentStation.y) * train.progress;
            const prevAngle = this.calculateAngle(currentStation.x, currentStation.y, nextStation.x, nextStation.y);
            
            // Move train along the line
            train.progress += train.speed;
            
            // Calculate new position
            const newX = currentStation.x + (nextStation.x - currentStation.x) * train.progress;
            const newY = currentStation.y + (nextStation.y - currentStation.y) * train.progress;
            const newAngle = this.calculateAngle(currentStation.x, currentStation.y, nextStation.x, nextStation.y);
            
            // Add position to history (store more points for smoother following)
            train.positionHistory.unshift({
                x: newX,
                y: newY,
                angle: newAngle
            });
            
            // Limit history size to avoid memory issues
            const maxHistorySize = 100;
            if (train.positionHistory.length > maxHistorySize) {
                train.positionHistory.pop();
            }
            
            // Update carriages
            let lastX = newX;
            let lastY = newY;
            
            for (const carriage of train.carriages) {
                // Calculate how far back in history to look based on follow distance
                const historyIndex = Math.min(
                    Math.floor(carriage.followDistance / train.speed),
                    train.positionHistory.length - 1
                );
                
                // If we have enough history, use it
                if (historyIndex < train.positionHistory.length) {
                    const historyPoint = train.positionHistory[historyIndex];
                    carriage.x = historyPoint.x;
                    carriage.y = historyPoint.y;
                    carriage.angle = historyPoint.angle;
                    
                    // Check if this carriage is too far from the previous one
                    const distanceFromPrevious = Math.sqrt(
                        Math.pow(carriage.x - lastX, 2) + 
                        Math.pow(carriage.y - lastY, 2)
                    );
                    
                    // If too far, adjust position to be closer
                    const maxDistance = 40; // Maximum allowed distance between carriages
                    if (distanceFromPrevious > maxDistance) {
                        // Calculate direction vector from this carriage to the previous one
                        const dx = lastX - carriage.x;
                        const dy = lastY - carriage.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        
                        // Normalize and scale to max distance
                        const ndx = dx / length;
                        const ndy = dy / length;
                        
                        // Position carriage at max distance from previous
                        carriage.x = lastX - ndx * maxDistance;
                        carriage.y = lastY - ndy * maxDistance;
                    }
                } else {
                    // Otherwise, place behind the previous carriage or locomotive
                    const offsetDistance = 35; // Fixed distance between carriages
                    const offsetX = -Math.cos(carriage.angle) * offsetDistance;
                    const offsetY = -Math.sin(carriage.angle) * offsetDistance;
                    carriage.x = lastX + offsetX;
                    carriage.y = lastY + offsetY;
                }
                
                // Update last position for next carriage
                lastX = carriage.x;
                lastY = carriage.y;
            }
            
            // If train reached the next station
            if (train.progress >= 1) {
                // Stop the train at the destination station
                train.stoppedAt = 'next';
                train.stopTime = this.stationStopTime;
                train.reachedDestination = true;
                train.hasCollectedPassengers = false; // Reset for the new stop
            }
        }
    }
    
    drawStations() {
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
        for (const station of city.stations) {
            // Draw station shape
            this.ctx.fillStyle = '#333';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Draw different shapes based on station.shape
            this.ctx.beginPath();
            
            switch (station.shape) {
                case 'circle':
                    this.ctx.arc(station.x, station.y, 15, 0, Math.PI * 2);
                    break;
                case 'square':
                    this.ctx.rect(station.x - 12, station.y - 12, 24, 24);
                    break;
                case 'triangle':
                    this.ctx.moveTo(station.x, station.y - 15);
                    this.ctx.lineTo(station.x + 15, station.y + 10);
                    this.ctx.lineTo(station.x - 15, station.y + 10);
                    this.ctx.closePath();
                    break;
                case 'diamond':
                    this.ctx.moveTo(station.x, station.y - 15);
                    this.ctx.lineTo(station.x + 15, station.y);
                    this.ctx.lineTo(station.x, station.y + 15);
                    this.ctx.lineTo(station.x - 15, station.y);
                    this.ctx.closePath();
                    break;
                case 'pentagon':
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                        const x = station.x + 15 * Math.cos(angle);
                        const y = station.y + 15 * Math.sin(angle);
                        if (i === 0) {
                            this.ctx.moveTo(x, y);
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                    this.ctx.closePath();
                    break;
            }
            
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw passenger count
            if (station.passengers > 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(station.passengers.toString(), station.x, station.y);
                
                // Draw capacity indicator (red circle when overcrowded)
                if (station.passengers > 80) {
                    this.ctx.beginPath();
                    this.ctx.arc(station.x, station.y - 25, 5, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'red';
                    this.ctx.fill();
                }
            }
        }
    }
    
    drawLines() {
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
        for (const line of city.lines) {
            if (line.stations.length < 2) continue;
            
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            
            const firstStation = city.stations[line.stations[0]];
            this.ctx.moveTo(firstStation.x, firstStation.y);
            
            for (let i = 1; i < line.stations.length; i++) {
                const station = city.stations[line.stations[i]];
                this.ctx.lineTo(station.x, station.y);
            }
            
            this.ctx.stroke();
        }
    }
    
    calculateAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    drawTrains() {
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
        for (const train of city.trains) {
            const line = city.lines[train.lineId];
            
            if (line.stations.length < 2) continue;
            
            const currentStationId = line.stations[train.stationIndex];
            const nextStationId = line.stations[train.nextStationIndex];
            
            const currentStation = city.stations[currentStationId];
            const nextStation = city.stations[nextStationId];
            
            // Interpolate position between stations
            const x = currentStation.x + (nextStation.x - currentStation.x) * train.progress;
            const y = currentStation.y + (nextStation.y - currentStation.y) * train.progress;
            
            // Calculate angle for train rotation
            const angle = this.calculateAngle(currentStation.x, currentStation.y, nextStation.x, nextStation.y);
            
            // Draw carriages first (behind the locomotive)
            for (const carriage of train.carriages) {
                this.ctx.save();
                this.ctx.translate(carriage.x, carriage.y);
                this.ctx.rotate(carriage.angle);
                
                // Draw carriage
                this.ctx.fillStyle = line.color;
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                
                // Carriage body - same size as locomotive
                this.ctx.beginPath();
                this.ctx.rect(-20, -6, 40, 12);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Windows
                this.ctx.fillStyle = '#DDD';
                this.ctx.beginPath();
                this.ctx.rect(-10, -4, 6, 8);
                this.ctx.rect(5, -4, 6, 8);
                this.ctx.fill();
                
                this.ctx.restore();
            }
            
            // Draw locomotive
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            
            // Draw rectangular train
            this.ctx.fillStyle = line.color;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            
            // Main body
            this.ctx.beginPath();
            this.ctx.rect(-20, -6, 40, 12);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Front/back details
            this.ctx.fillStyle = '#333';
            if (train.direction > 0) {
                // Front window
                this.ctx.fillRect(12, -4, 6, 8);
            } else {
                // Back window
                this.ctx.fillRect(-18, -4, 6, 8);
            }
            
            // Draw passenger count if any
            if (train.passengers > 0) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.rotate(-angle); // Counter-rotate for text
                this.ctx.fillText(train.passengers.toString(), 0, 0);
            }
            
            this.ctx.restore();
        }
    }
    
    drawCityInfo() {
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
        // Draw city name
        this.ctx.fillStyle = city.color;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${city.name} Subway System`, 20, 30);
    }
    
    drawDragLine() {
        if (!this.dragStart || !this.dragEnd) {
            return;
        }
        
        if (!this.cities || this.cities.length === 0) {
            return;
        }
        
        const city = this.isTutorialMode ? this.cities[0] : this.cities[this.currentCityIndex];
        
        if (!city) {
            return;
        }
        
            let lineColor = '#999'; // Default color
            
            if (this.selectedLine) {
                lineColor = this.selectedLine.color;
            } else if (city.lines.length > 0) {
                // Use the first line's color if no line is selected
                lineColor = city.lines[0].color;
            }
            
            this.ctx.strokeStyle = lineColor;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
            this.ctx.lineTo(this.dragEnd.x, this.dragEnd.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements
        this.drawCityInfo();
        this.drawLines();
        this.drawStations();
        this.drawTrains();
        this.drawDragLine();
        
        // Update the line info panel periodically
        if (this.frameCount % 60 === 0) { // Update once per second (assuming 60 FPS)
            this.updateLineInfoPanel();
        }
    }
    
    update() {
        // Update game time
        this.updateGameTime();
        
        if (this.isTutorialMode) {
            // In tutorial mode, we still need to update trains but don't spawn new stations or random passengers
            this.updateTrains();
            return;
        }
        
        const currentTime = Date.now();
        const city = this.cities[this.currentCityIndex];
        
        // Check if it's time to spawn a new station
        if (currentTime - this.lastStationSpawnTime > this.stationSpawnInterval) {
            this.addNewStation(city);
            this.lastStationSpawnTime = currentTime;
        }
        
        this.generatePassengers();
        this.updateTrains();
        
        // Update passenger satisfaction
        this.updateSatisfaction();
    }
    
    gameLoop() {
        if (!this.gameStarted) return;
        
        // Only update if not paused
        if (!this.isPaused) {
            this.update();
            this.render();
            this.frameCount++;
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            // When paused, just render once and don't request another frame
            this.render();
            
            // Set a flag to restart the loop when unpaused
            this.needsRestart = true;
        }
    }
    
    addNewStation(city) {
        if (city.stations.length >= this.maxStations) return;
        
        let x, y, tooClose;
        do {
            x = Math.random() * (this.canvas.width - 100) + 50;
            y = Math.random() * (this.canvas.height - 100) + 50;
            tooClose = false;
            
            // Check distance from other stations
            for (const station of city.stations) {
                const distance = Math.sqrt((x - station.x) ** 2 + (y - station.y) ** 2);
                if (distance < 100) { // Minimum distance between stations
                    tooClose = true;
                    break;
                }
            }
        } while (tooClose);
        
        const shape = this.stationShapes[Math.floor(Math.random() * this.stationShapes.length)];
        
        city.stations.push({
            id: city.stations.length,
            x: x,
            y: y,
            shape: shape,
            passengers: 0,
            connections: []
        });
    }
    
    resizeCanvas() {
        // Set canvas size to match its display size
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    startGame(cityIndex) {
        this.currentCityIndex = cityIndex;
        this.gameStarted = true;
        this.isTutorialMode = false; // Ensure we're not in tutorial mode
        
        // Hide start screen and show game
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // Initialize the game
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Reset game state
        this.cities = [];
        
        this.init();
        this.setupEventListeners();
        
        // Show city info
        this.showCityInfo(this.cityData[cityIndex]);
        
        // Reset time and resources
        this.gameTime = 0;
        this.lastRewardTime = 0;
        this.resources = {
            locomotives: 5,
            carriages: 10,
            lines: 3
        };
        
        // Create UI elements for time and resources
        this.createGameUI();
        
        // Check if intro has already been shown for this session
        if (!this.introShownThisSession) {
            this.showIntroOverlay();
            this.introShownThisSession = true;
        }
        
        this.gameLoop();
    }
    
    showCityInfo(cityData) {
        // Create city info overlay
        const cityInfoOverlay = document.createElement('div');
        cityInfoOverlay.id = 'city-info-overlay';
        cityInfoOverlay.className = 'overlay';
        
        const cityInfoContent = document.createElement('div');
        cityInfoContent.className = 'overlay-content';
        
        const cityTitle = document.createElement('h2');
        cityTitle.textContent = cityData.name + ' Subway System';
        cityTitle.style.color = cityData.color;
        
        const cityDescription = document.createElement('p');
        cityDescription.textContent = cityData.description;
        
        const startButton = document.createElement('button');
        startButton.textContent = 'Begin Building';
        startButton.addEventListener('click', () => {
            document.body.removeChild(cityInfoOverlay);
        });
        
        cityInfoContent.appendChild(cityTitle);
        cityInfoContent.appendChild(cityDescription);
        cityInfoContent.appendChild(startButton);
        cityInfoOverlay.appendChild(cityInfoContent);
        
        document.body.appendChild(cityInfoOverlay);
    }
    
    init() {
        // Create city subway systems
        for (let i = 0; i < this.cityData.length; i++) {
            const cityInfo = this.cityData[i];
            
            const city = {
                id: i,
                name: cityInfo.name,
                color: cityInfo.color,
                stationPrefix: cityInfo.stationPrefix,
                stations: [],
                lines: [],
                trains: [],
                passengers: 0,
                active: i === this.currentCityIndex
            };
            
            // Start with just 3 stations
            for (let j = 0; j < 3; j++) {
                this.addNewStation(city);
            }
            
            // Create initial line
            city.lines.push({
                id: 0,
                color: this.lineColors[0],
                stations: [],
                trains: []
            });
            
            this.cities.push(city);
        }
        
        // Add initial train to the active city
        this.addTrain(this.currentCityIndex, 0);
    }
    
    updateGameTime() {
        if (!this.gameStarted || this.isTutorialMode || this.isPaused) return;
        
        this.gameTime += 1/60; // Assuming 60 FPS, add 1/60 of a second
        
        // Check if a week has passed
        if (this.gameTime - this.lastRewardTime >= this.weekLength) {
            this.lastRewardTime = this.gameTime;
            // Pause and show reward selection instead of automatically giving a reward
            this.pauseGame(true);
        }
        
        // Update the clock display
        this.updateClockDisplay();
    }
    
    updateClockDisplay() {
        const totalDays = Math.floor(this.gameTime / this.dayLength);
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;
        
        const hours = Math.floor((this.gameTime % this.dayLength) / (this.dayLength/24));
        const minutes = Math.floor(((this.gameTime % this.dayLength) % (this.dayLength/24)) / (this.dayLength/24/60));
        
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `Week ${weeks + 1}, Day ${days + 1} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // Update resource display
        this.updateResourceDisplay();
    }
    
    updateResourceDisplay() {
        const locomotiveDisplay = document.getElementById('locomotive-count');
        const carriageDisplay = document.getElementById('carriage-count');
        const lineDisplay = document.getElementById('line-count');
        
        if (locomotiveDisplay) {
            locomotiveDisplay.textContent = this.resources.locomotives;
        }
        
        if (carriageDisplay) {
            carriageDisplay.textContent = this.resources.carriages;
        }
        
        if (lineDisplay) {
            lineDisplay.textContent = this.resources.lines;
        }
    }
    
    giveWeeklyReward() {
        // Determine which reward to give
        const rewardType = Math.floor(Math.random() * 3); // 0: locomotive, 1: carriages, 2: line
        
        switch (rewardType) {
            case 0:
                this.resources.locomotives += 1;
                this.resources.carriages += 2; // Each locomotive comes with 2 carriages
                this.showRewardNotification('New Locomotive (+2 Carriages)');
                break;
            case 1:
                this.resources.carriages += 3;
                this.showRewardNotification('3 New Carriages');
                break;
            case 2:
                this.resources.lines += 1;
                this.showRewardNotification('New Line');
                break;
        }
    }
    
    showRewardNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'reward-notification';
        notification.textContent = `Weekly Reward: ${message}`;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    createGameUI() {
        // Make sure game-controls exists
        let gameControls = document.getElementById('game-controls');
        if (!gameControls) {
            gameControls = document.createElement('div');
            gameControls.id = 'game-controls';
            
            // Create basic buttons
            const addLineButton = document.createElement('button');
            addLineButton.id = 'add-line';
            addLineButton.textContent = 'Add Line';
            
            const addTrainButton = document.createElement('button');
            addTrainButton.id = 'add-train';
            addTrainButton.textContent = 'Add Train';
            
            const addCarriageButton = document.createElement('button');
            addCarriageButton.id = 'add-carriage';
            addCarriageButton.textContent = 'Add Carriage';
            
            const backToMenuButton = document.createElement('button');
            backToMenuButton.id = 'back-to-menu';
            backToMenuButton.textContent = 'Back to Menu';
            
            // Add buttons to controls
            gameControls.appendChild(addLineButton);
            gameControls.appendChild(addTrainButton);
            gameControls.appendChild(addCarriageButton);
            gameControls.appendChild(backToMenuButton);
            
            // Add controls to game container
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.appendChild(gameControls);
            }
        }
        
        // Create time display
        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'time-display';
        timeDisplay.className = 'game-info';
        timeDisplay.textContent = 'Week 1, Day 1 - 00:00';
        
        // Create resource display
        const resourceDisplay = document.createElement('div');
        resourceDisplay.id = 'resource-display';
        resourceDisplay.className = 'game-info';
        
        const locomotiveInfo = document.createElement('div');
        locomotiveInfo.innerHTML = 'Locomotives: <span id="locomotive-count">5</span>';
        
        const carriageInfo = document.createElement('div');
        carriageInfo.innerHTML = 'Carriages: <span id="carriage-count">10</span>';
        
        const lineInfo = document.createElement('div');
        lineInfo.innerHTML = 'Lines: <span id="line-count">3</span>';
        
        resourceDisplay.appendChild(locomotiveInfo);
        resourceDisplay.appendChild(carriageInfo);
        resourceDisplay.appendChild(lineInfo);
        
        // Add to game controls
        gameControls.insertBefore(timeDisplay, gameControls.firstChild);
        gameControls.insertBefore(resourceDisplay, gameControls.firstChild);
        
        // Create pause button
        const pauseButton = document.createElement('button');
        pauseButton.id = 'pause-button';
        pauseButton.textContent = '⏸️';
        pauseButton.className = 'control-button';
        pauseButton.title = 'Pause Game';
        
        // Add pause button to game controls
        gameControls.appendChild(pauseButton);
        
        // Add satisfaction display
        const satisfactionContainer = document.createElement('div');
        satisfactionContainer.className = 'satisfaction-container';
        
        const satisfactionLabel = document.createElement('span');
        satisfactionLabel.textContent = 'Satisfaction: ';
        
        const satisfactionDisplay = document.createElement('span');
        satisfactionDisplay.id = 'satisfaction-display';
        satisfactionDisplay.textContent = '100%';
        satisfactionDisplay.style.color = 'green';
        
        satisfactionContainer.appendChild(satisfactionLabel);
        satisfactionContainer.appendChild(satisfactionDisplay);
        
        // Add to game controls
        gameControls.insertBefore(satisfactionContainer, gameControls.firstChild);
        
        // Re-add event listeners since we might have created new buttons
        this.setupEventListeners();
    }
    
    updateLineInfoPanel() {
        // This method is removed as per the new implementation
    }
    
    addCarriage(cityIndex, trainId) {
        // Check if we have available carriages
        if (this.resources.carriages <= 0) {
            this.showNotification('No available carriages! Wait for weekly rewards.');
            return;
        }
        
        const city = this.cities[cityIndex];
        const train = city.trains.find(t => t.id === trainId);
        
        if (train) {
            const newCarriage = {
                id: train.carriages.length,
                progress: 0,
                followDistance: (train.carriages.length + 1) * 0.1,
                capacity: this.carriageCapacity, // Use the carriage capacity from constructor
                passengers: 0,
                x: 0,
                y: 0,
                angle: 0
            };
            
            train.carriages.push(newCarriage);
            train.capacity += this.carriageCapacity; // Update total train capacity
            
            // Decrease available carriages
            this.resources.carriages--;
            this.updateResourceDisplay();
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    pauseGame(showRewardSelection = false) {
        this.isPaused = true;
        
        // Create white overlay for the entire game
        const gameOverlay = document.createElement('div');
        gameOverlay.id = 'game-white-overlay';
        gameOverlay.className = 'white-overlay';
        document.body.appendChild(gameOverlay);
        
        // Create pause overlay
        const pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'pause-overlay';
        pauseOverlay.className = 'overlay';
        
        const pauseContent = document.createElement('div');
        pauseContent.className = 'overlay-content';
        
        if (showRewardSelection) {
            // Weekly reward selection
            const rewardTitle = document.createElement('h2');
            rewardTitle.textContent = 'Weekly Reward';
            
            const rewardDescription = document.createElement('p');
            rewardDescription.textContent = 'Choose your reward for this week:';
            
            const rewardOptions = document.createElement('div');
            rewardOptions.className = 'reward-options';
            
            // Locomotive option
            const locomotiveOption = document.createElement('div');
            locomotiveOption.className = 'reward-option';
            locomotiveOption.innerHTML = '<h3>Locomotive</h3><p>1 new locomotive with 2 carriages</p>';
            locomotiveOption.addEventListener('click', () => {
                this.resources.locomotives += 1;
                this.resources.carriages += 2;
                this.updateResourceDisplay();
                this.resumeGame();
                this.showRewardNotification('New Locomotive (+2 Carriages)');
            });
            
            // Carriages option
            const carriageOption = document.createElement('div');
            carriageOption.className = 'reward-option';
            carriageOption.innerHTML = '<h3>Carriages</h3><p>3 new carriages</p>';
            carriageOption.addEventListener('click', () => {
                this.resources.carriages += 3;
                this.updateResourceDisplay();
                this.resumeGame();
                this.showRewardNotification('3 New Carriages');
            });
            
            // Line option
            const lineOption = document.createElement('div');
            lineOption.className = 'reward-option';
            lineOption.innerHTML = '<h3>Line</h3><p>1 new subway line</p>';
            lineOption.addEventListener('click', () => {
                this.resources.lines += 1;
                this.updateResourceDisplay();
                this.resumeGame();
                this.showRewardNotification('New Line');
            });
            
            rewardOptions.appendChild(locomotiveOption);
            rewardOptions.appendChild(carriageOption);
            rewardOptions.appendChild(lineOption);
            
            pauseContent.appendChild(rewardTitle);
            pauseContent.appendChild(rewardDescription);
            pauseContent.appendChild(rewardOptions);
        } else {
            // Regular pause menu
            const pauseTitle = document.createElement('h2');
            pauseTitle.textContent = 'Game Paused';
            
            const resumeButton = document.createElement('button');
            resumeButton.textContent = 'Resume Game';
            resumeButton.addEventListener('click', () => {
                this.resumeGame();
            });
            
            const menuButton = document.createElement('button');
            menuButton.textContent = 'Return to Menu';
            menuButton.addEventListener('click', () => {
                this.returnToStartScreen();
            });
            
            pauseContent.appendChild(pauseTitle);
            pauseContent.appendChild(resumeButton);
            pauseContent.appendChild(menuButton);
        }
        
        pauseOverlay.appendChild(pauseContent);
        document.body.appendChild(pauseOverlay);
    }
    
    resumeGame() {
        this.isPaused = false;
        
        // Remove white overlay
        const gameOverlay = document.getElementById('game-white-overlay');
        if (gameOverlay && gameOverlay.parentNode) {
            gameOverlay.parentNode.removeChild(gameOverlay);
        }
        
        // Remove pause overlay
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay && pauseOverlay.parentNode) {
            pauseOverlay.parentNode.removeChild(pauseOverlay);
        }
        
        // Restart the game loop if needed
        if (this.needsRestart) {
            this.needsRestart = false;
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    showIntroOverlay() {
        // Create white overlay for the entire game
        const gameOverlay = document.createElement('div');
        gameOverlay.id = 'game-white-overlay';
        gameOverlay.className = 'white-overlay';
        document.body.appendChild(gameOverlay);
        
        const introOverlay = document.createElement('div');
        introOverlay.id = 'intro-overlay';
        introOverlay.className = 'overlay';
        
        const introContent = document.createElement('div');
        introContent.className = 'overlay-content';
        
        const introTitle = document.createElement('h2');
        introTitle.textContent = 'Welcome to Mini Metro!';
        
        const introText = document.createElement('div');
        introText.innerHTML = `
            <p>Build an efficient subway network by connecting stations with lines.</p>
            <ul>
                <li>Drag from one station to another to create connections</li>
                <li>Add trains to transport passengers between stations</li>
                <li>Add carriages to existing trains to increase capacity</li>
                <li>Create new lines to optimize your network</li>
                <li>Every week, you'll get to choose a new reward</li>
            </ul>
            <p>Keep your network running smoothly to handle the growing passenger demand!</p>
        `;
        
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Building';
        startButton.addEventListener('click', () => {
            document.body.removeChild(introOverlay);
            
            // Remove white overlay
            const gameOverlay = document.getElementById('game-white-overlay');
            if (gameOverlay && gameOverlay.parentNode) {
                gameOverlay.parentNode.removeChild(gameOverlay);
            }
        });
        
        introContent.appendChild(introTitle);
        introContent.appendChild(introText);
        introContent.appendChild(startButton);
        introOverlay.appendChild(introContent);
        
        document.body.appendChild(introOverlay);
    }
    
    updateSatisfaction() {
        if (this.isTutorialMode) return;
        
        const city = this.cities[this.currentCityIndex];
        
        // Count overcrowded stations (using 100 as the threshold)
        const overcrowdedStations = city.stations.filter(station => station.passengers > 100).length;
        
        // Decrease satisfaction based on overcrowded stations
        if (overcrowdedStations > 0) {
            this.satisfaction -= this.satisfactionDecayRate * overcrowdedStations;
            
            // Ensure satisfaction doesn't go below 0
            if (this.satisfaction < 0) this.satisfaction = 0;
        } else {
            // Slowly recover satisfaction when no stations are overcrowded
            this.satisfaction += 0.005;
            
            // Cap at 100%
            if (this.satisfaction > 100) this.satisfaction = 100;
        }
        
        // Update satisfaction display
        this.updateSatisfactionDisplay();
        
        // Game over if satisfaction reaches 0
        if (this.satisfaction <= 0) {
            this.gameOver();
        }
    }
    
    updateSatisfactionDisplay() {
        const satisfactionElement = document.getElementById('satisfaction-display');
        if (satisfactionElement) {
            satisfactionElement.textContent = `${Math.floor(this.satisfaction)}%`;
            
            // Change color based on satisfaction level
            if (this.satisfaction > 70) {
                satisfactionElement.style.color = 'green';
            } else if (this.satisfaction > 40) {
                satisfactionElement.style.color = 'orange';
            } else {
                satisfactionElement.style.color = 'red';
            }
        }
    }
    
    gameOver() {
        this.pauseGame();
        
        // Create game over overlay
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.className = 'overlay';
        
        const gameOverContent = document.createElement('div');
        gameOverContent.className = 'overlay-content';
        
        const gameOverTitle = document.createElement('h2');
        gameOverTitle.textContent = 'Game Over';
        gameOverTitle.style.color = 'red';
        
        const gameOverMessage = document.createElement('p');
        gameOverMessage.textContent = 'Your subway system has failed! Passenger satisfaction reached 0%.';
        
        const statsTitle = document.createElement('h3');
        statsTitle.textContent = 'Your Stats';
        
        const statsContent = document.createElement('div');
        statsContent.innerHTML = `
            <p>Total Passengers Transported: ${this.totalPassengers}</p>
            <p>Days Operated: ${Math.floor(this.gameTime / this.dayLength)}</p>
            <p>Trains Built: ${this.cities[this.currentCityIndex].trains.length}</p>
        `;
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Try Again';
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameOverOverlay);
            this.startGame(this.currentCityIndex);
        });
        
        const menuButton = document.createElement('button');
        menuButton.textContent = 'Return to Menu';
        menuButton.addEventListener('click', () => {
            document.body.removeChild(gameOverOverlay);
            this.returnToStartScreen();
        });
        
        gameOverContent.appendChild(gameOverTitle);
        gameOverContent.appendChild(gameOverMessage);
        gameOverContent.appendChild(statsTitle);
        gameOverContent.appendChild(statsContent);
        gameOverContent.appendChild(restartButton);
        gameOverContent.appendChild(menuButton);
        
        gameOverOverlay.appendChild(gameOverContent);
        document.body.appendChild(gameOverOverlay);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new MiniMetroGame();
}); 