// food learning
let learnedFoods = JSON.parse(localStorage.getItem("learnedFoods")) || {};
// TOTAL TARGETS
let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFats = 0;

// globar parameteres
let remainingCaloriesGlobal = 0;
let remainingProtein = 0;
let remainingCarbs = 0;
let remainingFats = 0;

//store last failed food
let pendingFood = "";
let pendingQuantity = 0;

//  data
const foodDatabase = {
  rice: { type: "weight", calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  chicken: { type: "weight", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  paneer: { type: "weight", calories: 280, protein: 20, carbs: 3, fats: 25 },
  milk: { type: "weight", calories: 60, protein: 3.2, carbs: 5, fats: 3.3 },

  egg: { type: "unit", calories: 70, protein: 6, carbs: 1, fats: 5 },
  banana: { type: "unit", calories: 90, protein: 1, carbs: 23, fats: 0.3 },
  roti: { type: "unit", calories: 120, protein: 3, carbs: 20, fats: 3 },
};

// history
function addToHistory(food, quantity, calories) {
  let list = document.getElementById("foodList");

  let li = document.createElement("li");
  li.innerText = `${food} (${quantity}) - ${Math.round(calories)} kcal`;

  list.appendChild(li);
}

// progress line
function updateProgress() {
  if (totalCalories === 0) return;

  let percent =
    ((totalCalories - remainingCaloriesGlobal) / totalCalories) * 100;

  document.getElementById("calorieBar").style.width = percent + "%";
}

// save data
function saveData() {
  const data = {
    remainingCaloriesGlobal,
    remainingProtein,
    remainingCarbs,
    remainingFats,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    history: document.getElementById("foodList").innerHTML,
  };

  localStorage.setItem("decifitData", JSON.stringify(data));
}

// SCROLL
function scrollToResults() {
  document.getElementById("result").scrollIntoView({
    behavior: "smooth",
  });
}

function calculate() {
  let age = document.getElementById("age").value;
  let height = document.getElementById("height").value;
  let weight = document.getElementById("weight").value;
  let gender = document.getElementById("gender").value;
  let activity = document.getElementById("activity").value;
  let goal = document.getElementById("goal").value;

  if (!age || !height || !weight) {
    document.getElementById("result").innerHTML = "Please fill all fields";
    return;
  }

  if (age <= 0 || height <= 0 || weight <= 0) {
    document.getElementById("result").innerHTML =
      "Enter valid positive numbers";
    return;
  }

  age = Number(age);
  height = Number(height);
  weight = Number(weight);
  activity = Number(activity);

  let goalText =
    goal === "lose"
      ? "Fat Loss"
      : goal === "gain"
        ? "Muscle Gain"
        : "Maintenance";

  let activityText =
    activity == 1.2
      ? "Sedentary"
      : activity == 1.375
        ? "Lightly Active"
        : activity == 1.55
          ? "Moderately Active"
          : "Very Active";

  let message =
    goal === "lose"
      ? "So you want to lose fat — great choice. We'll guide you into a calorie deficit while keeping your protein high to preserve muscle."
      : goal === "gain"
        ? "Looking to build muscle — love that. We'll help you stay in a calorie surplus with the right macros for growth."
        : "Maintaining your physique — solid. We'll help you stay consistent and balanced with your nutrition.";

  let summary = `
    <div class="summary-box">
      <p class="summary-message">${message}</p>
      <div class="summary-grid">
        <div><span>Age</span><strong>${age}</strong></div>
        <div><span>Height</span><strong>${height} cm</strong></div>
        <div><span>Weight</span><strong>${weight} kg</strong></div>
        <div><span>Goal</span><strong>${goalText}</strong></div>
        <div><span>Activity</span><strong>${activityText}</strong></div>
      </div>
    </div>
  `;

  document.querySelector(".form").style.display = "none";
  document.getElementById("userSummary").style.display = "block";
  document.getElementById("summaryText").innerHTML = summary;

  let bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  let maintenance = bmr * activity;
  let target =
    goal === "lose"
      ? maintenance - 500
      : goal === "gain"
        ? maintenance + 300
        : maintenance;

  let protein = weight * 2;
  let fats = weight * 0.8;
  let carbs = (target - (protein * 4 + fats * 9)) / 4;

  totalCalories = Math.round(target);
  totalProtein = Math.round(protein);
  totalCarbs = Math.round(carbs);
  totalFats = Math.round(fats);

  remainingCaloriesGlobal = totalCalories;
  remainingProtein = totalProtein;
  remainingCarbs = totalCarbs;
  remainingFats = totalFats;

  //  RESTORE DASHBOARD UI
  document.getElementById("result").innerHTML = `
    <div class="dashboard fade-in">

      <div class="card">
        <h3>Maintenance</h3>
        <p>${Math.round(maintenance)} kcal</p>
      </div>

      <div class="card">
        <h3>Target</h3>
        <p>${Math.round(target)} kcal</p>
      </div>

      <div class="card">
        <h3>Macros</h3>
        <p>Protein: ${Math.round(protein)}g</p>
        <p>Fats: ${Math.round(fats)}g</p>
        <p>Carbs: ${Math.round(carbs)}g</p>
      </div>

    </div>
  `;

  document.getElementById("tracker").style.display = "block";
  document.getElementById("tracker").classList.add("fade-in");

  document.getElementById("remainingCalories").innerText =
    `Remaining: ${remainingCaloriesGlobal} kcal`;

  document.getElementById("remainingMacros").innerText =
    `Protein: ${remainingProtein}g | Carbs: ${remainingCarbs}g | Fats: ${remainingFats}g`;

  updateProgress();
  saveData();
  scrollToResults();
}
// delete food from memory
function deleteFood(food) {
  delete learnedFoods[food];
  localStorage.setItem("learnedFoods", JSON.stringify(learnedFoods));

  renderSavedFoods();
}
function renderSavedFoods() {
  let list = document.getElementById("savedFoodsList");
  list.innerHTML = "";

  for (let food in learnedFoods) {
    let li = document.createElement("li");

    li.innerHTML = `
      ${food}
      <button class="delete-btn" onclick="deleteFood('${food}')">X</button>
    `;

    list.appendChild(li);
  }
}
//function to clear food
function clearLearnedFoods() {
  localStorage.removeItem("learnedFoods");
  learnedFoods = {};
  alert("Saved foods cleared");
  renderSavedFoods();
}
//  MAIN FUNCTION
function addFood() {
  let food = document.getElementById("foodName").value.toLowerCase().trim();
  let quantity = Number(document.getElementById("foodQuantity").value);

  if (!food || !quantity) {
    alert("Enter food and quantity");
    return;
  }

  let item = foodDatabase[food] || learnedFoods[food];

  //  IF FOOD EXISTS IN DATABASE
  if (item) {
    let factor = item.type === "weight" ? quantity / 100 : quantity;

    let calories = item.calories * factor;
    let protein = item.protein * factor;
    let carbs = item.carbs * factor;
    let fats = item.fats * factor;

    // HIDE MANUAL INPUT IF VISIBLE
    document.getElementById("manualInput").style.display = "none";

    updateTracking(food, quantity, calories, protein, carbs, fats);
    return;
  }

  //  NOT FOUND → SHOW MANUAL INPUT
  pendingFood = food;
  pendingQuantity = quantity;

  document.getElementById("manualInput").style.display = "block";
}
//  MANUAL INPUT FUNCTION
function useManualData() {
  if (!pendingFood) return;
  let calories = Number(document.getElementById("manualCalories").value);
  let protein = Number(document.getElementById("manualProtein").value);
  let carbs = Number(document.getElementById("manualCarbs").value);
  let fats = Number(document.getElementById("manualFats").value);

  if (!calories) {
    alert("Enter valid manual data");
    return;
  }

  updateTracking(pendingFood, pendingQuantity, calories, protein, carbs, fats);
  // for avoiding data poisoning
  if (!confirm("Save this food for future use?")) {
    updateTracking(
      pendingFood,
      pendingQuantity,
      calories,
      protein,
      carbs,
      fats,
    );
    return;
  }
  // SAVE LEARNED FOOD
  learnedFoods[pendingFood] = {
    type: "weight",
    calories: calories / (pendingQuantity / 100),
    protein: protein / (pendingQuantity / 100),
    carbs: carbs / (pendingQuantity / 100),
    fats: fats / (pendingQuantity / 100),
  };
  renderSavedFoods();

  localStorage.setItem("learnedFoods", JSON.stringify(learnedFoods));
  // HIDE BOX AFTER USE
  document.getElementById("manualInput").style.display = "none";

  // CLEAR INPUTS
  document.getElementById("manualCalories").value = "";
  document.getElementById("manualProtein").value = "";
  document.getElementById("manualCarbs").value = "";
  document.getElementById("manualFats").value = "";
}

// UPDATE TRACKING
function updateTracking(food, quantity, calories, protein, carbs, fats) {
  remainingCaloriesGlobal -= calories;
  remainingProtein -= protein;
  remainingCarbs -= carbs;
  remainingFats -= fats;

  addToHistory(food, quantity, calories);

  document.getElementById("remainingCalories").innerText =
    `Remaining: ${Math.round(remainingCaloriesGlobal)} kcal`;

  document.getElementById("remainingMacros").innerText =
    `Protein: ${Math.round(remainingProtein)}g | Carbs: ${Math.round(
      remainingCarbs,
    )}g | Fats: ${Math.round(remainingFats)}g`;

  updateProgress();
  saveData();

  document.getElementById("foodName").value = "";
  document.getElementById("foodQuantity").value = "";
}

// LOAD
window.onload = function () {
  let saved = localStorage.getItem("decifitData");
  if (!saved) return;

  let data = JSON.parse(saved);

  remainingCaloriesGlobal = data.remainingCaloriesGlobal;
  remainingProtein = data.remainingProtein;
  remainingCarbs = data.remainingCarbs;
  remainingFats = data.remainingFats;

  totalCalories = data.totalCalories;

  document.getElementById("tracker").style.display = "block";
  document.getElementById("foodList").innerHTML = data.history;

  updateProgress();
  renderSavedFoods();
};

// RESET
function resetDay() {
  localStorage.removeItem("decifitData");

  document.getElementById("tracker").style.display = "none";
  document.getElementById("manualInput").style.display = "none";

  document.getElementById("foodList").innerHTML = "";
  document.getElementById("calorieBar").style.width = "0%";
}
