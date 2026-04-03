document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".main").style.display = "none";
  document.getElementById("workoutScreen").style.display = "none";
  document.getElementById("selectionScreen").style.display = "none";
});
// food learning
let learnedFoods = JSON.parse(localStorage.getItem("learnedFoods")) || {};
//total stuff
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
async function saveData() {
  const user = auth.currentUser;
  if (!user) return;

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

  try {
    await setDoc(doc(db, "users", user.uid), data);

    // backup locally
    localStorage.setItem("decifitData", JSON.stringify(data));
  } catch (err) {
    console.error("Firestore save error:", err);
  }
}

// scroll logic for phone ui
function scrollToResults() {
  document.getElementById("result").scrollIntoView({
    behavior: "smooth",
  });
}

window.calculate = function () {
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
};
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
window.clearLearnedFoods = function () {
  localStorage.removeItem("learnedFoods");
  learnedFoods = {};
  alert("Saved foods cleared");
  renderSavedFoods();
};
window.addFood = function () {
  let food = document.getElementById("foodName").value.toLowerCase().trim();
  let quantity = Number(document.getElementById("foodQuantity").value);

  if (!food || !quantity) {
    alert("Enter food and quantity");
    return;
  }

  let item = foodDatabase[food] || learnedFoods[food];

  if (item) {
    let factor = item.type === "weight" ? quantity / 100 : quantity;

    let calories = item.calories * factor;
    let protein = item.protein * factor;
    let carbs = item.carbs * factor;
    let fats = item.fats * factor;

    document.getElementById("manualInput").style.display = "none";

    updateTracking(food, quantity, calories, protein, carbs, fats);
    return;
  }

  pendingFood = food;
  pendingQuantity = quantity;

  document.getElementById("manualInput").style.display = "block";
};
//  plan B
window.useManualData = function () {
  if (!pendingFood) return;

  let calories = Number(document.getElementById("manualCalories").value);
  let protein = Number(document.getElementById("manualProtein").value);
  let carbs = Number(document.getElementById("manualCarbs").value);
  let fats = Number(document.getElementById("manualFats").value);

  if (calories <= 0 || protein < 0 || carbs < 0 || fats < 0) {
    alert("Enter valid nutrition values");
    return;
  }

  // ✅ update ONLY ONCE
  updateTracking(pendingFood, pendingQuantity, calories, protein, carbs, fats);

  // ask for saving AFTER tracking
  if (confirm("Save this food for future use?")) {
    learnedFoods[pendingFood] = {
      type: "weight",
      calories: calories / (pendingQuantity / 100),
      protein: protein / (pendingQuantity / 100),
      carbs: carbs / (pendingQuantity / 100),
      fats: fats / (pendingQuantity / 100),
    };

    localStorage.setItem("learnedFoods", JSON.stringify(learnedFoods));
    renderSavedFoods();
  }

  document.getElementById("manualInput").style.display = "none";

  // clear inputs
  document.getElementById("manualCalories").value = "";
  document.getElementById("manualProtein").value = "";
  document.getElementById("manualCarbs").value = "";
  document.getElementById("manualFats").value = "";
};

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

window.onload = function () {
  let saved = localStorage.getItem("decifitData");
  if (saved) {
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
  }
  loadExercises();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById("authBox").style.display = "none";
      document.getElementById("selectionScreen").style.display = "block";

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          remainingCaloriesGlobal = data.remainingCaloriesGlobal;
          remainingProtein = data.remainingProtein;
          remainingCarbs = data.remainingCarbs;
          remainingFats = data.remainingFats;

          totalCalories = data.totalCalories;

          document.getElementById("tracker").style.display = "block";
          document.getElementById("foodList").innerHTML = data.history;

          updateProgress();
        }
      } catch (err) {
        console.error("Firestore load error:", err);
      }
    }
    document.querySelector(".logout-btn").style.display = user
      ? "block"
      : "none";
    if (user) {
      loadWorkoutFromCloud(user);
    }
  });
};

// RESET
window.resetDay = function () {
  localStorage.removeItem("decifitData");

  document.getElementById("tracker").style.display = "none";
  document.getElementById("manualInput").style.display = "none";

  document.getElementById("foodList").innerHTML = "";
  document.getElementById("calorieBar").style.width = "0%";
};

window.signup = function () {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created!");
    })
    .catch((err) => alert(err.message));
};

window.login = function () {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Logged in!");
      document.getElementById("authBox").style.display = "none";
      document.getElementById("selectionScreen").style.display = "block";
    })
    .catch((err) => alert(err.message));
};

window.logout = function () {
  signOut(auth)
    .then(() => {
      document.getElementById("authBox").style.display = "block";
      document.querySelector(".main").style.display = "none";

      // optional: clear inputs
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
    .catch((err) => alert(err.message));
};

window.togglePassword = function () {
  let input = document.getElementById("password");
  let icon = document.querySelector(".toggle-eye i");

  if (input.type === "password") {
    input.type = "text";
    icon.setAttribute("data-lucide", "eye-off");
  } else {
    input.type = "password";
    icon.setAttribute("data-lucide", "eye");
  }

  lucide.createIcons(); // refresh icon
};
window.goToDiet = function () {
  document.getElementById("selectionScreen").style.display = "none";
  document.getElementById("workoutScreen").style.display = "none";
  document.querySelector(".main").style.display = "flex";
};

window.goToWorkout = function () {
  document.getElementById("selectionScreen").style.display = "none";
  document.querySelector(".main").style.display = "none";
  document.getElementById("workoutScreen").style.display = "block";
};

window.saveWorkout = function () {
  let selects = document.querySelectorAll(".day-card select");

  let plan = [];

  selects.forEach((select, index) => {
    plan.push({
      day: index + 1,
      workout: select.value,
    });
  });

  localStorage.setItem("workoutPlan", JSON.stringify(plan));

  alert("Workout plan saved");
};

let selectedDay = null;

// when user clicks "Add" on a day
window.selectDay = function (day) {
  selectedDay = day;
};

// when user clicks + on exercise
window.addExercise = function (exercise) {
  if (!selectedDay) {
    alert("Select a day first");
    return;
  }

  let container = document.getElementById(`${selectedDay}-workout`);
  let div = document.createElement("div");
  div.className = "exercise-item";

  div.innerHTML = `
    <span>${exercise}</span>
    <button class="delete-exercise" onclick="this.parentElement.remove()">✖</button>
  `;

  container.appendChild(div);
};

let exerciseData = {};

async function loadExercises() {
  try {
    const res = await fetch("exercises.json");
    const data = await res.json();

    // group by body part
    data.forEach((ex) => {
      let category = ex.bodyPart;

      if (!exerciseData[category]) {
        exerciseData[category] = [];
      }

      exerciseData[category].push({
        name: ex.name,
        img: ex.img,
      });
    });

    renderExercises();
  } catch (err) {
    console.error("Error loading exercises:", err);
  }
}

function renderExercises() {
  const container = document.getElementById("exerciseContainer");
  container.innerHTML = "";

  for (let part in exerciseData) {
    const groupDiv = document.createElement("div");
    groupDiv.className = "exercise-group";

    const title = document.createElement("h4");
    title.innerText = part;

    const grid = document.createElement("div");
    grid.className = "exercise-grid";

    exerciseData[part].forEach((ex) => {
      const card = document.createElement("div");
      card.className = "exercise-card";

      card.innerHTML = `
       <img src="${ex.img}" onerror="this.style.display='none'">
        <p>${ex.name}</p>
        <button onclick="addExercise('${ex.name}')">+</button>
      `;

      grid.appendChild(card);
    });

    groupDiv.appendChild(title);
    groupDiv.appendChild(grid);
    container.appendChild(groupDiv);
  }
}

// filter function
window.filterBy = function (category) {
  const groups = document.querySelectorAll(".exercise-group");

  groups.forEach((group) => {
    const title = group.querySelector("h4").innerText;

    if (category === "All" || title === category) {
      group.style.display = "block";
    } else {
      group.style.display = "none";
    }
  });
};
window.filterByDropdown = function () {
  const selected = document.getElementById("muscleFilter").value;
  const groups = document.querySelectorAll(".exercise-group");

  groups.forEach((group) => {
    const title = group.querySelector("h4").innerText;

    if (selected === "All" || title === selected) {
      group.style.display = "block";
    } else {
      group.style.display = "none";
    }
  });
};

window.addCustomExercise = function (day) {
  const input = document.getElementById(`${day}-input`);
  const value = input.value.trim();

  if (!value) return;

  let container = document.getElementById(`${day}-workout`);

  let div = document.createElement("div");
  div.className = "exercise-item";

  div.innerHTML = `
    <span>${value}</span>
    <button class="delete-exercise" onclick="this.parentElement.remove()">✖</button>
  `;

  container.appendChild(div);

  input.value = "";
};
// saving plan
window.saveWorkoutToCloud = async function () {
  const user = auth.currentUser;
  if (!user) {
    alert("Login first");
    return;
  }

  const days = [
    "monday",
    "tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let plan = {};

  days.forEach((day) => {
    const container = document.getElementById(`${day}-workout`);
    const exercises = container.querySelectorAll("span");

    plan[day] = [];

    exercises.forEach((ex) => {
      plan[day].push(ex.innerText);
    });
  });

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        workoutPlan: plan,
      },
      { merge: true },
    );

    alert("Workout saved to cloud 💪");
  } catch (err) {
    console.error(err);
    alert("Error saving workout");
  }
};

async function loadWorkoutFromCloud(user) {
  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const plan = data.workoutPlan;

    if (!plan) return;

    for (let day in plan) {
      const container = document.getElementById(`${day}-workout`);
      container.innerHTML = ""; // clear old

      plan[day].forEach((exercise) => {
        let div = document.createElement("div");
        div.className = "exercise-item";

        div.innerHTML = `
          <span>${exercise}</span>
          <button class="delete-exercise" onclick="this.parentElement.remove()">✖</button>
        `;

        container.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Load error:", err);
  }
}

window.goBackToSelection = function () {
  document.getElementById("workoutScreen").style.display = "none";
  document.querySelector(".main").style.display = "none";
  document.getElementById("selectionScreen").style.display = "block";
};

const text =
  "The first rule of KcalClub is we DO talk about KcalClub.\nThe second rule of KcalClub is — please DO talk about KcalClub.";

let index = 0;

function typeEffect() {
  const el = document.getElementById("typing-text");

  if (index < text.length) {
    el.innerHTML += text.charAt(index) === "\n" ? "<br>" : text.charAt(index);
    index++;
    setTimeout(typeEffect, 25);
  }
}

window.addEventListener("load", () => {
  typeEffect();
});
