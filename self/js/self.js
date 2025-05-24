const quoteContainer = document.getElementById('quoteContainer');

const quotes = [
    { text: "Indeed, Allah is with those who are patient - Quran 2:153"},
    { text: "And He found you lost and guided you. - Quran 93:7"},
    { text: "So verily, with hardship, there is ease. - Quran 94:6"},
    { text: "Allah does not burden a soul beyond that it can bear. - Quran 2:286"},
    { text: "Take advantage of five before five: youth before old age, health before sickness, wealth before poverty, free time before busyness, and life before death. – Prophet Muhammad (PBUH)"},
    { text: "And whoever puts their trust in Allah, He will be enough for them. – Quran 65:3"},
    { text: "Do not grieve, indeed Allah is with us. – Quran 9:40"},
    { text: "A moment of patience in a moment of anger prevents a thousand moments of regret. – Ali Ibn Abi Talib (RA)"},
    { text: "Knowledge is that which benefits, not that which is memorized. – Imam Al-Shafi’i"},
    { text: "If you want to focus more on Allah in your prayers, focus more on Him outside your prayers. – Yasmin Mogahed"},
    { text: "And they planned, and Allah also planned, and Allah is the best of planners. – Quran 3:54"},
    { text: "Do not love the one who doesn’t love Allah. If they can leave Allah, they will leave you. – Imam Al-Shafi’i"},
    { text: "Knowledge without action is wastefulness, and action without knowledge is foolishness. – Imam Al-Ghazali"},
    { text: "The sign of sincerity is that you are indifferent to praise and blame. – Sahl Al-Tustari"},
    { text: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray."},
    { text: "Let not your yesterday ruin your today."},
    { text: "And it may be that you dislike a thing that is good for you and that you like a thing that is bad for you. God knows but you do not know. – Quran 2:216"},
    { text: "Tear your heart out of your chest and hand it to Allah. There is no other healing."}
];



function displayQuote(){
    quoteContainer.classList.remove('show');
    setTimeout(()=>{
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteContainer.innerHTML = `<p>"${randomQuote.text}"</p>`;
    quoteContainer.classList.add('show');
    }, 500);
}
displayQuote();
setInterval(displayQuote, 5000);

console.log("Quote script loaded!");
