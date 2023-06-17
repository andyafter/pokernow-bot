// Function to log card values as a combined string and click the "Fold" button if required
function logCardValues() {
  const targetElement = document.querySelector(".table-player-cards");
  const foldButton = document.querySelector(".button-1.with-tip.fold.red");
  const audio = new Audio(chrome.runtime.getURL('notification.mp3'));

  if (targetElement && foldButton) {
    const cardContainers = targetElement.querySelectorAll(".card-container");

    // Array to store individual card values
    const cardValues = [];

    // Iterate over the card containers
    cardContainers.forEach((container) => {
      const cardValueElement = container.querySelector(".value");
      const cardSuitElement = container.querySelector(".suit");

      if (cardValueElement && cardSuitElement) {
        const cardValue = cardValueElement.textContent;
        const cardSuit = cardSuitElement.textContent;

        cardValues.push(`${cardValue}${cardSuit}`);
      }
    });

    // Combine card values into a single string
    const combinedCardValues = cardValues.join("-");

    console.log("Combined Card Values:", combinedCardValues);

    // Check if the card values are not "Ac-Ah" or "Ah-As"
    if (foldHand(combinedCardValues)) {
      foldButton.click(); // Click the "Fold" button
    } else {
      audio.play();
    }
  }
}

function foldHand(hand) {
  cards = hand.split('-')
  if (getCardValue(cards[0]) == getCardValue(cards[1])) {
    // keep all the big pairs
    if (getCardValue(cards[0]) >= 6) {
      return false;
    }
  }

  // true means fold
  return !goodRange(hand);
}

function goodRange(hand) {
  cards = hand.split('-')
  const goodRange = new Set(['AK', 'KA', 'AQ', 'QA', 'KQ', 'QK'])
  c = cards[0][0] + cards[1][0]

  //const sosoRange = new Set(["KJ","JK","QJ","JQ", "10J", "J10", 'AJ', 'JA'])
  const sosoRange = new Set(["QJ", "JQ", "10J", "J10"])
  // 4-5 people
  if (sosoRange.has(c)) {
    if (cards[0][-1] == cards[1][-1]) {
      return true
    }
  }
  if (goodRange.has(c)) {
    return true
  }
  return false
}

function checkSuited(hand) {
  cards = hand.split('-')
  return cards[0][-1] == cards[1][-1]
}

function getCardValue(card) {
  const cardValues = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'T': 10,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
  };
  return cardValues[card.slice(0, -1)]
}

// Function to log a message
function logHello(newPosition) {
  console.log("Hello! The dealer position has changed to", newPosition);
  logCardValues(); // Call logCardValues() when the dealer position changes
}

// Function to observe mutations in the dealer position element
function observeDealerPosition() {
  const targetSelector = ".dealer-button-ctn";
  const mutationConfig = { attributes: true };

  // Callback function to execute when the target element is found
  function handleTargetElement(targetElement) {
    const observer = new MutationObserver(function (mutationsList) {
      for (let mutation of mutationsList) {
        if (mutation.attributeName === "class") {
          const currentClasses = Array.from(mutation.target.classList);
          const positionClass = currentClasses.find((cls) =>
            cls.startsWith("dealer-position-")
          );
          if (positionClass) {
            const newPosition = positionClass.split("-")[2];
            logHello(newPosition);
          }
        }
      }
    });

    const config = { attributes: true };
    observer.observe(targetElement, config);
  }

  // Function to check if the target element exists
  function checkTargetElement() {
    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      handleTargetElement(targetElement);
      logCardValues(); // Call logCardValues() initially when the target element is found
    } else {
      setTimeout(checkTargetElement, 500);
    }
  }

  // Start checking for the target element
  checkTargetElement();
}

// Function to check if it's the player's turn to act
function isPlayerTurn() {
  const playerElement = document.querySelector(".table-player-position-1");
  return playerElement.classList.contains("decision-current");
}

function findGtoTabAndPrintElements() {
  // Query all tabs with the GTO Wizard URL
  chrome.tabs.query({ url: 'https://app.gtowizard.com/*' }, function (tabs) {
    console.log(tabs)
    // If a GTO Wizard tab is found
    if (tabs.length) {
      // Inject a content script into the GTO Wizard tab
      chrome.tabs.executeScript(tabs[0].id, {
        code: `
          // Find all elements with the 'cardsymbols_value' class
          let elements = Array.from(document.getElementsByClassName('cardsymbols_value'));
          // Map the elements to their text content
          let data = elements.map(element => element.textContent);
          // Log the data
          console.log(data);
        `
      });
    } else {
      console.log('No GTO Wizard tab found');
    }
  });
}

function clickEvent() {
  console.log('Hello');
}

document.addEventListener('click', clickEvent);

// Execute the function when the page has finished loading
window.addEventListener("load", observeDealerPosition);