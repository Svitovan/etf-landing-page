// Two independent proportions; equal arms, two-sided alpha=.05, power=.80.
// Normal approximation: pooled variance under H0, separate variances under H1.
const pA = 0.05;
const pB = 0.06;
const zAlpha = 1.959963984540054;
const zPower = 0.8416212335729143;
const mean = (pA + pB) / 2;
const perArm = Math.ceil((
  (zAlpha * Math.sqrt(2 * mean * (1 - mean)) +
   zPower * Math.sqrt(pA * (1 - pA) + pB * (1 - pB))) / (pB - pA)
) ** 2);
console.log(JSON.stringify({ baseline: pA, alternative: pB, absoluteMde: pB - pA,
  relativeMde: (pB - pA) / pA, alpha: 0.05, power: 0.80, perArm,
  plannedPerArm: Math.ceil(perArm / 100) * 100 }, null, 2));
