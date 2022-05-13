//Reset audio context
document.documentElement.addEventListener("mousedown", () => {
  if (Tone.context.state !== "running") Tone.context.resume();
});

let currentMovement = 1;

const gainNode = new Tone.Gain(0).toDestination();
//const filter = new Tone.Filter(1500, "bandpass").connect(gainNode);
const pitchShift = new Tone.PitchShift(0).connect(gainNode);
const Lyre = new Tone.Player(
  "https://monlim.github.io/Borderlands/Audio/LyreReson.mp3"
).connect(pitchShift);


// let t1on = false;
// let accelActivate = 2;
// let accelDeactivate = 0.2;
// function triggerSampler(accel) {
//   if (accel >= accelActivate) {
//     if (t1on) return;
//     t1on = true;
//     sampler.triggerAttackRelease([noteDict[Math.floor(Math.random() * 11)]], 2);
//   }
//   if (accel < accelDeactivate) {
//     t1on = false;
//   }
// }

//listen for updates to Midi2 trigger note
movement.onchange = function(){
  currentMovement = movement.value;
};


function handleOrientation(event) {
  //pitchShift.pitch = scaleValue(event.beta, [-180, 180], [0, 12]);
  if (event.beta < 10) pitchShift.pitch = 0;
  if (10 <= event.beta && event.beta < 60) pitchShift.pitch = 2;
  if (60 <= event.beta && event.beta < 100) pitchShift.pitch = 5;
  if (event.beta >= 100) pitchShift.pitch = 8;
}


let accel;
function handleMotion(event) {
  
  accel =
    event.acceleration.x ** 2 +
    event.acceleration.y ** 2 +
    event.acceleration.z ** 2;
  // updateFieldIfNotNull('All', accel);
 // GA.volume.value = scaleValue(accel, [0, 10], [-24, 0]);
  //triggerSampler(accel);
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
    //window.removeEventListener("shake", shakeEventDidOccur, false);
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    //myShakeEvent.stop();
    //Tone.Transport.stop();
    if (currentMovement === 1) Lyre.stop();
    gainNode.gain.rampTo(0, 0.1);
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    //window.addEventListener("shake", shakeEventDidOccur, false);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
    if (currentMovement === 1) Lyre.start();
    //myShakeEvent.start();
    //Tone.Transport.start();
    gainNode.gain.rampTo(1, 0.1);
    is_running = true;
  }
};

function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

// //exponential scale
// let powerScale = d3
//   .scalePow()
//   .exponent(1.4)
//   .domain([0, 6])
//   .range([0, 1])
//   .clamp(true);

// var myShakeEvent = new Shake({
//   threshold: 10, // optional shake strength threshold
//   timeout: 1000, // optional, determines the frequency of event generation
// });

// //function to call when shake occurs
// function shakeEventDidOccur() {
//   shakeDict[Math.floor(Math.random() * 27)].start();
//   //alert('shake!');
// }
