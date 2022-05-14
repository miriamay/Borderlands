//Reset audio context
document.documentElement.addEventListener("mousedown", () => {
  if (Tone.context.state !== "running") Tone.context.resume();
});

let currentMovement = "1";
console.log("v25");

const gainNode = new Tone.Gain(0).toDestination();
const gainNode2 = new Tone.Gain(0).connect(gainNode);
//const lowpass = new Tone.Filter(18000, "lowpass").connect(gainNode);
const phaser = new Tone.Phaser({
  frequency: 15,
  octaves: 5,
  baseFrequency: 1000,
}).connect(gainNode);
const reverb = new Tone.Reverb(3).connect(gainNode);
reverb.wet.value = 0.4;
const pitchShift = new Tone.PitchShift(0).connect(reverb);
const pluckedEnv = new Tone.AmplitudeEnvelope({
  attack: 0.05,
  decay: 0.1,
  sustain: 0.15,
  release: 0.1,
  decayCurve: "exponential",
}).connect(pitchShift);
const Lyre = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/LyreReson4.mp3"
).connect(pluckedEnv);
const Flute = new Tone.Player({
  url: "https://miriamay.github.io/Borderlands/Audio/Flute.mp3",
  loop: true,
  playbackRate: 1,
  loopStart: 0,
  loopEnd: 1,
}).connect(gainNode2);
const Frog1 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog1.mp3"
).toDestination();
const Frog2 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog2.mp3"
).toDestination();
const Frog3 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog3.mp3"
).toDestination();
const Frog4 = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Frog4.mp3"
).toDestination();
const Witches = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Witches.mp3"
).connect(reverb);
const Owl = new Tone.Player(
  "https://miriamay.github.io/Borderlands/Audio/Owl2.mp3"
).connect(phaser);
// const Sooty = new Tone.Player({
//   url: "https://miriamay.github.io/Borderlands/Audio/Sooty.mp3",
//   loop: true,
// }).connect(pitchShift);

let t1on = false;
let accelActivate = 2;
let accelDeactivate = 0.2;
//trigger Lyre
function trigger1(accel) {
  if (accel >= accelActivate) {
    if (t1on) return;
    t1on = true;
    pluckedEnv.triggerAttackRelease(0.4);
  }
  if (accel < accelDeactivate) {
    t1on = false;
  }
}

//trigger Flute Mimicry
function trigger5(accel) {
  if (accel >= accelActivate) {
    if (t1on) return;
    t1on = true;
    gainNode2.gain.rampTo(1, 0.1);
    setTimeout(function () {
      gainNode2.gain.rampTo(0, 0.5);
    }, 1000);
  }
  if (accel < accelDeactivate) {
    t1on = false;
  }
}

const frogDict = {
  1: Frog1,
  2: Frog2,
  3: Frog3,
  4: Frog4,
};

//listen for updates to Midi2 trigger note
movement.onchange = function () {
  currentMovement = movement.value;
  if (currentMovement !== "1") {
    Lyre.stop();
  } else {
    (reverb.wet.value = 0.5), (reverb.decay = 3);
  }
  if (currentMovement !== "1" && currentMovement !== "4") pitchShift.pitch = 0;
  if (currentMovement !== "2") myShakeEvent.stop();
  if (currentMovement !== "3") {
    Witches.stop();
  } else {
    reverb.decay = 20;
  }
  if (currentMovement !== "4") {
    Owl.stop();
    //Sooty.stop();
  } else {
    reverb.wet.value = 0;
  }
  if (currentMovement !== "5") Flute.stop();
  demo_button.innerHTML = "START";
  document.getElementById("circle").style.background = "green";
  is_running = false;
};

function handleOrientation(event) {
  if (currentMovement === "1") {
    if (event.beta < 10) pitchShift.pitch = 5;
    if (10 <= event.beta && event.beta < 60) pitchShift.pitch = 0;
    if (60 <= event.beta && event.beta < 100) pitchShift.pitch = -2;
    if (event.beta >= 100) pitchShift.pitch = -9;
  }
  if (currentMovement === "3") {
    reverb.wet.value = scaleValue(Math.abs(event.gamma), [0, 90], [1, 0]);
    //reverb.decay = scaleValue(event.beta, [-90, 90], [2, 10]);
  }
  if (currentMovement === "4") {
    pitchShift.pitch = scaleValue(event.beta, [-50, 150], [-12, 0]);
  }
  //lowpass.frequency = scaleValue(event.beta, [-32, 140], [2000, 10000]);
  //Sooty.volume.value = scaleValue(Math.abs(event.gamma), [0, 90], [-36, 0]);
  //Owl.volume.value = clamp(-16 - Sooty.volume.value, -36, 0);
  //}
  phaser.frequency.value = scaleValue(event.beta, [-50, 150], [0, 15]);
  phaser.baseFrequency = scaleValue(
    Math.abs(event.gamma),
    [0, 90],
    [100, 2000]
  );
  if (currentMovement === "5") {
    Flute.playbackRate = scaleValue(event.beta, [-50, 150], [0.25, 2.5]);
    Flute.loopStart = scaleValue(Math.abs(event.gamma), [0, 90], [0, 140]);
    Flute.loopEnd = Flute.loopStart + 1;
  }
}

let accel;
function handleMotion(event) {
  accel =
    event.acceleration.x ** 2 +
    event.acceleration.y ** 2 +
    event.acceleration.z ** 2;
  //Sooty.volume.value = scaleValue(accel, [0, 10], [-24, 0]);
  if (currentMovement === "1") trigger1(accel);
  if (currentMovement === "5") trigger5(accel);
}

let is_running = false;
let demo_button = document.getElementById("start_demo");

demo_button.onclick = function (e) {
  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    window.removeEventListener("shake", shakeEventDidOccur, false);
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    myShakeEvent.stop();
    gainNode.gain.rampTo(0, 0.1);
    Lyre.stop();
    Flute.stop();
    Witches.stop();
    Owl.stop();
    //Sooty.stop();
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("shake", shakeEventDidOccur, false);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
    if (currentMovement === "1") {
      Lyre.start();
    }
    if (currentMovement === "2") {
      myShakeEvent.start();
    }
    if (currentMovement === "3") {
      Witches.start();
    }
    if (currentMovement === "4") {
      Owl.start();
      //Sooty.start();
    }
    if (currentMovement === "5") {
      Flute.start();
    }
    gainNode.gain.rampTo(1, 0.1);
    is_running = true;
  }
};

function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// //exponential scale
// let powerScale = d3
//   .scalePow()
//   .exponent(1.4)
//   .domain([0, 6])
//   .range([0, 1])
//   .clamp(true);

var myShakeEvent = new Shake({
  threshold: 8, // optional shake strength threshold
  timeout: 1000, // optional, determines the frequency of event generation
});

//function to call when shake occurs
function shakeEventDidOccur() {
  frogDict[Math.floor(Math.random() * 5)].start();
  //alert('shake!');
}
