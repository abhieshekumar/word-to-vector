const animate = ["animate__headShake", "animate__bounce","animate__flash","animate__tada", "animate__fadeIn"];
let triggered = false;
let currMsgInd = 0;
const initialLoader =['|','/','—','\\'];
let loadIndex = 0;

const wordVectors = ml5.word2vec("./asset/wordvecs10000.json", modelReady);

const loader = setInterval(function () {
  document.getElementById('words').scrollIntoView();
	const element = document.querySelector('#initialLoader');
  	if(loadIndex>=initialLoader.length) {
    	loadIndex = 0;
  	}
  	element.innerHTML = "Loading "+initialLoader[loadIndex];
  	loadIndex++;
}, 400);


function modelReady() {
  clearInterval(loader);
  document.querySelector('#inputSection').scrollIntoView()
  const element = document.querySelector('#initialLoader');
  element.innerHTML = ":)";
  placeholderUpdate();
}

function getNearest() {
  let word = document.querySelector('#userinput').value;
  word = word.toLowerCase();
  if(word.indexOf('+')>0 || word.indexOf('-')>0) {
    expression(word);
  } else {
    justWord(word);
  }
}

function notInCorpus() {
  document.getElementById('words').scrollIntoView();
  const parent = document.querySelector('#wordWrapper');
  parent.innerHTML = "";
  const animation = animate[Math.floor(Math.random() * animate.length)]
  const para = document.createElement("div");
  wordVectors.getRandomWord(function(err, result) {
    const data = document.createTextNode(":/ Try "+"'"+result+"'");
    para.appendChild(data);
    para.classList.add("word");
    para.classList.add("animate__animated");
    para.classList.add(animation);
    para.addEventListener("click", function() {
    justWord(result);
    });
    parent.appendChild(para);
  });
}

function justWord(word) {
  wordVectors.nearest(word).then(results => {
    const temp = [];
    if(!results) {
      notInCorpus();
    } else {
      for(let i = 0;i<5;i++){
        temp.push(results[i].word);
      }
      createWords(temp);
    }
  }).catch(err => {
    notInCorpus();
  })
}

async function placeholderUpdate() {
  await sleep(1000);
  const msg = ["try a word", "fun+games", "day-work"];
  const ele = document.querySelector('#userinput');
  ele.value = "";
  if(currMsgInd>=msg.length) {
    currMsgInd = 0;
  }
  ele.placeholder = msg[currMsgInd];
  currMsgInd++;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createWords(words) {
  document.getElementById('words').scrollIntoView();
  const parent = document.querySelector('#wordWrapper');
  parent.innerHTML = "";
  const animation = animate[Math.floor(Math.random() * animate.length)]
  for(let i=0; i<words.length; i++) {
    const para = document.createElement("div");
    gap = (i==words.length-1)?"":",";
    const data = document.createTextNode(words[i]+gap);
    para.appendChild(data);
    para.classList.add("word");
    para.classList.add("animate__animated");
    if(i==0 && triggered === false) {
      const tool = document.createElement("span");
      tool.classList.add("tooltiptext");
      const helpdata = document.createTextNode("Tap Me");
      tool.appendChild(helpdata);
      para.appendChild(tool);
    }
    para.classList.add(animation);
    para.addEventListener("click", function() {
      triggered = true;
      justWord(words[i]);
    })
    parent.appendChild(para);			
    await sleep(700);
  }
  if(triggered === false) {
    document.querySelector('.tooltiptext').classList.add("tooltiptextshow");
  }
  placeholderUpdate();
}

function expression(expr) {
  let exprNoSpace = expr.replace(" ", "");
  let temp = exprNoSpace.replace("-","$");
  temp = temp.replace("+","$");
  let ind = temp.indexOf("$");
  let word = temp.substring(0, ind);
  let word2 = temp.substring(ind+1);
  if(exprNoSpace.charAt(ind) === '+') {
    wordVectors.add([word.toLowerCase(), word2.toLowerCase()]).then(results => {
      const temp = [];
      for(let i = 0;i<5;i++){
        temp.push(results[i].word);
      }
      createWords(temp);
    }).catch(err => {
      notInCorpus();
    });
  } else {
    wordVectors.subtract([word.toLowerCase(), word2.toLowerCase()]).then(results => {
      const temp = [];
      for(let i = 0;i<5;i++){
        temp.push(results[i].word);
      }
      createWords(temp);
    }).catch(err => {
      notInCorpus();
    });
  }
}