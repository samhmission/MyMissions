"use strict"; // ~ Enforce strict mode for better error-checking

// ~ Select DOM elements related to total weight calculation
const totalWeightsBtn = document.getElementById("total-weights-btn");
const totalWeightDisplay = document.querySelector(".total-weight-display");

// ~ Select DOM elements related to target weight input
const targetWeightInput = document.getElementById("target-weight-input");

// ~ Select DOM elements for barbell checkboxes and custom barbell input
const olympicBarbellChkbox = document.getElementById("olympic-barbell");
const standardBarbellChkbox = document.getElementById("standard-barbell");
const ezCurlBarbellChkbox = document.getElementById("ez-curl-barbell");
const customBarbellChkbox = document.getElementById("custom-barbell");
const weightDistributionChkbox = document.getElementById("weight-distribution");
const customBarbellInput = document.getElementById("custom-barbell-input");

// ~ Select DOM elements for calculation button and result display
const calculateBtn = document.getElementById("calculate-btn");
const resultDisplay = document.querySelector(".result-display");

// ~ Array to store the user's selected weights and their amounts
const weightsData = [];

/*
 * Function to gather data from each weights-container
 * and push the weight and amount to weightsData array
 * Returns the array of weights and amounts
 */
function getWeightsData() {
  const weightsContainers = document.querySelectorAll(".weights-container");

  weightsContainers.forEach((container) => {
    const label = container.querySelector("label").textContent.trim();
    const selectedValue = container.querySelector("select").value;

    if (selectedValue !== "0") {
      // ~ Only add to the array if the selected value is not '0'
      weightsData.push({
        weight: +label, // ~ Convert label text to a number
        amount: +selectedValue, // ~ Convert selected value to a number
      });
    }
  });
  return weightsData;
}

/*
 * Event listener for the 'Total weight' button.
 * Calculates and displays the total weight of selected plates.
 */
totalWeightsBtn.addEventListener("click", () => {
  const currentWeightsData = getWeightsData(); // ~ Retrieve weights data
  let totalWeight = 0;

  // ~ Calculate total weight by multiplying each weight by its amount
  currentWeightsData.forEach((element) => {
    totalWeight += element.weight * element.amount;
  });

  // ~ Display the total weight on the page
  totalWeightDisplay.textContent = `Total Weight: ${totalWeight} kg`;
});

/*
 * Event listener for the 'Calculate' button.
 * Handles the logic for determining plate combinations and remaining weight.
 */
calculateBtn.addEventListener("click", () => {
  const targetWeight = targetWeightInput.value; // ~ Get target weight from input
  const customBarbellWeight = customBarbellInput.value; // ~ Get custom barbell weight
  const distributeWeightEvenly = weightDistributionChkbox.checked; // ~ Check if weight should be distributed evenly

  let currentWeight = 0;

  // ~ Add weight of selected barbells
  if (olympicBarbellChkbox.checked) {
    currentWeight += 20;
  }

  if (standardBarbellChkbox.checked) {
    currentWeight += 15;
  }

  if (ezCurlBarbellChkbox.checked) {
    currentWeight += 10;
  }

  if (customBarbellChkbox.checked) {
    currentWeight += customBarbellWeight;
  }

  // ~ Calculate the remaining weight needed after accounting for barbells
  let weightToDistribue = targetWeight - currentWeight;

  // ~ If distributing weight evenly, split the remaining weight in half
  if (distributeWeightEvenly) {
    weightToDistribue /= 2;
  }

  /*
   * Function to calculate the most efficient combination of plates
   * @param {number} weightToDistribue - The weight that needs to be distributed
   * @returns {Object} - Contains plate combinations and remaining weight
   */
  function calculatePlateCombination(weightToDistribue) {
    const plateCombinations = [];
    let remainingWeight = weightToDistribue;

    // ~ Iterate through weightsData to find the best plate combination
    weightsData.forEach((plate) => {
      const plateWeight = plate.weight;
      const plateAmount = plate.amount;
      let numPlates = 0;

      // ~ Add plates until the remaining weight is less than the plate weight
      while (remainingWeight >= plateWeight && numPlates < plateAmount) {
        remainingWeight -= plateWeight;
        numPlates++;
      }

      // ~ Store the used plates in plateCombinations
      if (numPlates > 0) {
        plateCombinations.push({
          weight: plateWeight,
          amount: numPlates,
        });
      }
    });

    // ~ Return the plate combinations and any remaining weight
    return {
      plateCombinations,
      remainingWeight: remainingWeight > 0 ? remainingWeight : 0,
    };
  }

  // ~ Get the best plate combinations and remaining weight
  // ~ destructing assignment
  // ~ This allows you to extract multiple properties from an object
  // ~ (or elements from an array) and assign them to variables in a single statement
  const { plateCombinations, remainingWeight } =
    calculatePlateCombination(weightToDistribue);

  // ~ Build the result display text
  let resultText = `Target Weight<br>${targetWeight}kg<br><br>`;

  // ~ If weight is distributed evenly, add a note
  if (distributeWeightEvenly) {
    resultText += `Note: Add the plate(s) to both sides<br><br>`;
  }

  resultText += `Plate(s)<br>`;

  // ~ Append each plate combination to the result text
  plateCombinations.forEach((plate) => {
    resultText += `${plate.amount} x ${plate.weight}kg<br>`;
  });

  // ~ Display remaining weight if any, adjusting for even distribution
  if (remainingWeight > 0 && !distributeWeightEvenly) {
    resultText += `<br>Total weight remaining<br>${remainingWeight.toFixed(
      2
    )}kg<br>`;
  }
  if (remainingWeight > 0 && distributeWeightEvenly) {
    resultText += `<br>Total weight remaining<br>${(
      remainingWeight * 2
    ).toFixed(2)}kg<br>`;
  }

  // ~ Display the final result on the page
  resultDisplay.innerHTML = resultText;
});
