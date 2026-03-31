// 🔥 GLOBAL STATE (REVERSE TRACKING)
let remainingCaloriesGlobal = 0;
let remainingProtein = 0;
let remainingCarbs = 0;
let remainingFats = 0;

// 🍗 FOOD DATABASE
const foodDatabase = {
  rice: { type: "weight", calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  chicken: { type: "weight", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  paneer: { type: "weight", calories: 280, protein: 20, carbs: 3, fats: 25 },
  milk: { type: "weight", calories: 60, protein: 3.2, carbs: 5, fats: 3.3 },

  egg: { type: "unit", calories: 70, protein: 6, carbs: 1, fats: 5 },
  banana: { type: "unit", calories: 90, protein: 1, carbs: 23, fats: 0.3 },
  roti: { type: "unit", calories: 120, protein: 3, carbs: 20, fats: 3 },
};

function calculate() {
  let age = document.getElementById("age").value;
  let height = document.getElementById("height").value;
  let weight = document.getElementById("weight").value;
  let gender = document.getElementById("gender").value;
  let activity = document.getElementById("activity").value;
  let goal = document.getElementById("goal").value;

  // 🛑 VALIDATION
  if (!age || !height || !weight) {
    document.getElementById("result").innerHTML = "Please fill all fields";
    return;
  }

  if (age <= 0 || height <= 0 || weight <= 0) {
    document.getElementById("result").innerHTML =
      "Enter valid positive numbers";
    return;
  }

  // 🔢 Convert
  age = Number(age);
  height = Number(height);
  weight = Number(weight);
  activity = Number(activity);

  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  let maintenance = bmr * activity;
  let target;

  if (goal === "lose") {
    target = maintenance - 500;
  } else if (goal === "gain") {
    target = maintenance + 300;
  } else {
    target = maintenance;
  }

  // 🔥 SET TARGETS (REVERSE SYSTEM)
  let protein = weight * 2;
  let fats = weight * 0.8;
  let carbs = (target - (protein * 4 + fats * 9)) / 4;

  remainingCaloriesGlobal = Math.round(target);
  remainingProtein = Math.round(protein);
  remainingCarbs = Math.round(carbs);
  remainingFats = Math.round(fats);

  // ⚡ LOADING
  document.getElementById("result").innerHTML = `
    <p>Generating your plan...</p>
    <div class="loading-bar">
      <div class="loading-fill"></div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById("result").innerHTML = `
      <div class="dashboard">

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

    // 🔥 SHOW TRACKER
    document.getElementById("tracker").style.display = "block";

    // 🔥 UPDATE UI
    document.getElementById("remainingCalories").innerText =
      `Remaining: ${remainingCaloriesGlobal} kcal`;

    document.getElementById("remainingMacros").innerText =
      `Protein: ${remainingProtein}g | Carbs: ${remainingCarbs}g | Fats: ${remainingFats}g`;
  }, 1000);
}

function addFood() {
  let food = document.getElementById("foodName").value.toLowerCase();
  let quantity = Number(document.getElementById("foodQuantity").value);

  if (!food || !quantity) {
    alert("Enter food and quantity");
    return;
  }

  let item = foodDatabase[food];

  if (!item) {
    alert("Food not in database");
    return;
  }

  let factor = item.type === "weight" ? quantity / 100 : quantity;

  let calories = item.calories * factor;
  let protein = item.protein * factor;
  let carbs = item.carbs * factor;
  let fats = item.fats * factor;

  // 🔥 REVERSE TRACKING
  remainingCaloriesGlobal -= calories;
  remainingProtein -= protein;
  remainingCarbs -= carbs;
  remainingFats -= fats;

  // 🔥 UPDATE UI
  document.getElementById("remainingCalories").innerText =
    `Remaining: ${Math.round(remainingCaloriesGlobal)} kcal`;

  document.getElementById("remainingMacros").innerText =
    `Protein: ${Math.round(remainingProtein)}g | Carbs: ${Math.round(remainingCarbs)}g | Fats: ${Math.round(remainingFats)}g`;

  // clear inputs
  document.getElementById("foodName").value = "";
  document.getElementById("foodQuantity").value = "";
}
