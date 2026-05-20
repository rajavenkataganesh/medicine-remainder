let medicines = [];
let audioContext = null;
let audioReady = false;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

async function unlockAudio() {
  initAudio();

  try {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    audioReady = true;
  } catch (error) {
    console.log("Audio unlock failed:", error);
  }
}

function playBeep() {
  if (!audioContext || !audioReady) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.7);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.7);
}

async function testSound() {
  await unlockAudio();
  playBeep();
  alert("If you heard the beep, sound is working.");
}

function addLog(message) {
  let dailyLogs = document.getElementById("dailyLogs");
  let logItem = document.createElement("li");
  let now = new Date();
  let timeText = now.toLocaleTimeString();
  logItem.textContent = message + " (" + timeText + ")";
  dailyLogs.appendChild(logItem);
}

function addMedicine() {
  let name = document.getElementById("medicineName").value;
  let time = document.getElementById("medicineTime").value;
  let list = document.getElementById("medicineList");

  if (name === "" || time === "") {
    alert("Please enter medicine name and time");
    return;
  }

  let medicine = {
    name: name,
    time: time,
    alerted: false
  };

  medicines.push(medicine);

  let li = document.createElement("li");

  let medicineText = document.createElement("span");
  medicineText.textContent = name + " - " + time;

  let takenBtn = document.createElement("button");
  takenBtn.textContent = "Taken";

  let missedBtn = document.createElement("button");
  missedBtn.textContent = "Missed";

  let deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  takenBtn.onclick = function () {
    medicineText.style.color = "green";
    medicineText.style.fontWeight = "bold";
    medicineText.textContent = name + " - " + time + " - Taken";
    addLog(name + " marked as Taken");
  };

  missedBtn.onclick = function () {
    medicineText.style.color = "red";
    medicineText.style.fontWeight = "bold";
    medicineText.textContent = name + " - " + time + " - Missed";
    addLog(name + " marked as Missed");
  };

  deleteBtn.onclick = function () {
    li.remove();
    medicines = medicines.filter(function (m) {
      return !(m.name === name && m.time === time);
    });
    addLog(name + " deleted");
  };

  li.appendChild(medicineText);
  li.appendChild(takenBtn);
  li.appendChild(missedBtn);
  li.appendChild(deleteBtn);

  list.appendChild(li);

  addLog(name + " added for " + time);

  document.getElementById("medicineName").value = "";
  document.getElementById("medicineTime").value = "";
}

setInterval(function () {
  let now = new Date();
  let currentHours = String(now.getHours()).padStart(2, "0");
  let currentMinutes = String(now.getMinutes()).padStart(2, "0");
  let currentTime = currentHours + ":" + currentMinutes;

  medicines.forEach(function (medicine) {
    if (medicine.time === currentTime && medicine.alerted === false) {
      if (audioReady) {
        playBeep();
      }
      alert("Reminder: Take " + medicine.name + " now!");
      addLog("Reminder alert for " + medicine.name);
      medicine.alerted = true;
    }
  });
}, 10000);

document.addEventListener("click", function () {
  if (!audioReady) {
    unlockAudio();
  }
}, { once: true });