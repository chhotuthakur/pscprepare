// Initialize Firebase with your own config
const firebaseConfig = {
    apiKey: "AIzaSyD-iVW626fXLl6Itv2D8VTHek3HW7dyjdk",
    authDomain: "upscqapp.firebaseapp.com",
    databaseURL: "https://upscqapp.firebaseio.com",
    projectId: "upscqapp",
    storageBucket: "upscqapp.appspot.com",
    messagingSenderId: "623746098558",
    appId: "1:623746098558:web:753f9c24392b2bdad27f2f",
    measurementId: "G-ZHRL8NDH84"
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized successfully!");
const database = firebase.database();


// Initialize Firebase

var currentUnit;
var currentChapter;
var totalChapters;

function updateProgressBar() {
    var progress = (currentChapter / totalChapters) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

function loadUnits() {
    var navbar = document.getElementById('navbar');
    navbar.innerHTML = ''; // Clear navbar

    // Fetch units from Firebase RTDB
    database.ref('/units').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var unitName = childSnapshot.key;

            var unitItem = document.createElement('li');
            unitItem.classList.add('nav-1'); // Add class
            var link = document.createElement('a');
            link.textContent = unitName;
            link.href = '#'; // Add your unit link here
            unitItem.appendChild(link);
            unitItem.addEventListener('click', function() {
                currentUnit = unitName;
                loadChapters();
            });

            navbar.appendChild(unitItem);
        });
    });
}

function loadChapters() {
    var subNavbar = document.getElementById('subNavbar');
    subNavbar.innerHTML = ''; // Clear subNavbar

    // Fetch chapters for the selected unit
    database.ref('/units/' + currentUnit + '/chapters').once('value').then(function(snapshot) {
        var chapters = snapshot.val();
        totalChapters = Object.keys(chapters).length;

        var chapterList = document.createElement('ul');
        chapterList.classList.add('nav-1'); // Add class

        for (var chapter in chapters) {
            if (chapters.hasOwnProperty(chapter)) {
                var chapterItem = document.createElement('li');
                chapterItem.classList.add('nav-1'); // Add class
                var link = document.createElement('a');
                link.textContent = chapter;
                link.href = '#'; // Add your chapter link here
                chapterItem.appendChild(link);
                chapterItem.addEventListener('click', function() {
                    currentChapter = this.textContent;
                    loadContent();
                });

                chapterList.appendChild(chapterItem);
            }
        }

        // Display subNavbar
        subNavbar.appendChild(chapterList);
        subNavbar.style.display = 'block'; // Changed from 'flex' to 'block' for list items
        updateProgressBar();
    });
}

function loadContent() {
    var contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Clear content

    // Fetch content for the selected chapter
    database.ref('/units/' + currentUnit + '/chapters/' + currentChapter).once('value').then(function(snapshot) {
        var chapter = snapshot.val();

        // Display theory
        var theoryDiv = document.createElement('div');
        theoryDiv.innerHTML = '<h2>Theory</h2>' + chapter.theory;
        contentDiv.appendChild(theoryDiv);

        // Display questions and answers
        var qaDiv = document.createElement('div');
        qaDiv.innerHTML = '<h2>Questions and Answers</h2>';

        chapter.questions.forEach(function(questionData, index) {
            var questionParagraph = document.createElement('p');
            questionParagraph.textContent = questionData.question;

            // Display options
            var optionsDiv = document.createElement('div');
            questionData.options.forEach(function(option, optionIndex) {
                var radioInput = document.createElement('input');
                radioInput.setAttribute('type', 'radio');
                radioInput.setAttribute('name', 'option' + index);
                radioInput.setAttribute('value', optionIndex);
                optionsDiv.appendChild(radioInput);

                var optionLabel = document.createElement('label');
                optionLabel.textContent = option;
                optionsDiv.appendChild(optionLabel);
                optionsDiv.appendChild(document.createElement('br'));
            });

            var checkButton = document.createElement('button');
            checkButton.textContent = 'Check Answer';
            checkButton.addEventListener('click', function() {
                var selectedOption = document.querySelector('input[name="option' + index + '"]:checked');
                if (selectedOption) {
                    var userAnswer = parseInt(selectedOption.value, 10);
                    if (userAnswer === questionData.correctAnswer) {
                        checkButton.disabled = true;
                        // Move to the next chapter or update progress
                        if (currentChapter < totalChapters) {
                            currentChapter++;
                            loadChapters();
                        } else {
                            alert('You have completed all chapters in this unit!');
                        }
                    } else {
                        alert('Incorrect answer. Try again!');
                    }
                } else {
                    alert('Please select an option before checking the answer.');
                }
            });

            qaDiv.appendChild(questionParagraph);
            qaDiv.appendChild(optionsDiv);
            qaDiv.appendChild(checkButton);
        });

        contentDiv.appendChild(qaDiv);

        // Update progress bar
        updateProgressBar();
    });
}

// Load units when the page loads
loadUnits();
