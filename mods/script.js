const diffSugar = document.querySelector('tw-storydata');

(onStartup = () => {
  let tiddlers = document.querySelectorAll('#store-area > div');
  if (diffSugar) tiddlers = document.querySelectorAll('tw-passagedata');
  let prinplupCheckpoints = false;
  Array.from(tiddlers).forEach((tiddler) => {
    if (tiddler.textContent.includes('[[Checkpoint'))
      prinplupCheckpoints = true;
    if (!diffSugar)
      tiddler.textContent = tiddler.textContent.split('\\n').join('\n');
  });
  if (!prinplupCheckpoints) addCheckpointButtons();
  addChoiceHints(tiddlers);
})();

function addCheckpointButtons() {
  let leftPane = document.querySelector('div[tiddler="StoryCaption"]');
  if (diffSugar)
    leftPane = document.querySelector('tw-passagedata[name="StoryCaption"]');
  leftPane.textContent +=
    '<nav id="menu">' +
    '<ul>' +
    '<li class="set-checkpoint">' +
    '<a>Set Checkpoint</a>' +
    '</li>' +
    '<li class="load-checkpoints">' +
    '<a>Load Checkpoints</a>' +
    '</li>' +
    '<li class="remove-checkpoints">' +
    '<a>Remove Checkpoints</a>' +
    '</li>' +
    '</ul>' +
    '</nav>';
}

function addChoiceHints(tiddlers) {
  tiddlers.forEach((tiddler) => {
    let notStoryCaption = false;

    if (diffSugar)
      notStoryCaption = tiddler.attributes['name'].value !== 'StoryCaption';
    else
      notStoryCaption = tiddler.attributes['tiddler'].value !== 'StoryCaption';

    if (notStoryCaption) {
      let lines = tiddler.textContent.split('\n');
      lines = lines.map((line) => {
        if (line.includes('][$')) {
          let variableChanges = line
            .replace(/.+?\]\[\$/, '$')
            .replace(']]', '')
            .replace(/;\$/g, '; $')
            .replace(/; /g, '\n')
            .split('\n');
          variableChanges = variableChanges.map((change) => {
            change = change.replace('==', 'to');
            if (!changeIsBlacklisted(change)) {
              if (change.includes('_preg') || change.includes('girlfriend'))
                return `<div class="relation-change">${change.replace(
                  '$',
                  '',
                )}</div>\n`;
              else if (change.includes('+='))
                return `<div class="positive-change">${change.replace(
                  '$',
                  '',
                )}</div>\n`;
              else if (change.includes('-='))
                return `<div class="negative-change">${change.replace(
                  '$',
                  '',
                )}</div>\n`;
              else
                return `<div class="special-change">${change.replace(
                  '$',
                  '',
                )}</div>\n`;
            }
          });
          variableChanges = variableChanges.join('');
          if (variableChanges)
            return `<div class="variable-text">\n${variableChanges}</div>${line}`;
          else return line;
        } else return line;
      });
      tiddler.textContent = lines.join('\n');
    }
  });
}

function changeIsBlacklisted(change) {
  let isBlacklisted = false;

  const blacklist = ['mm_shirtless'];

  blacklist.forEach((element) => {
    if (change.includes(element)) isBlacklisted = true;
  });

  return isBlacklisted;
}

function initializeVariables() {
  if (!SugarCube.State.variables.checkpoints)
    SugarCube.State.variables.checkpoints = [];
}

function addSetButtonFunctionality() {
  const setButton = document.querySelector('.set-checkpoint');
  setButton.addEventListener('click', () => {
    const currentPassage =
      document.querySelector('.checked').attributes['data-passage'].value;

    const checkpointName = prompt('Set checkpoint as:', currentPassage);

    const { dayD, dayN, time } = SugarCube.State.variables;
    if (checkpointName) {
      const nameTaken = (obj) => obj.name === `${checkpointName}`;

      if (!SugarCube.State.variables.checkpoints.some(nameTaken)) {
        SugarCube.State.variables.checkpoints.push({
          name: checkpointName,
          passage: currentPassage,
          checkpointD: dayD,
          checkpointN: dayN,
          checkpointTime: time,
        });
      }
    }
  });
}

function addLoadButtonFunctionality() {
  const loadButton = document.querySelector('.load-checkpoints');
  loadButton.addEventListener('click', () => {
    if (document.querySelector('.botnet-popup')) $('.botnet-popup').remove();

    $(document.body).prepend(
      '<div class="botnet-popup">' +
        '<div class="popup-text">Select which checkpoint you would like to load:</div>' +
        '</div>',
    );

    const currentCheckpoints = [
      ...SugarCube.State.variables.checkpoints,
    ].reverse();

    currentCheckpoints.forEach((checkpoint) => {
      const checkpointLink = $(
        `<div class="botnet-checkpoint">${checkpoint.name}</div>`,
      );
      $('.botnet-popup').append(checkpointLink);

      $(checkpointLink).on('click', () => {
        SugarCube.State.variables.dayD = checkpoint.checkpointD;
        SugarCube.State.variables.dayN = checkpoint.checkpointN;
        SugarCube.State.variables.time = checkpoint.checkpointTime;
        SugarCube.State.variables.energy = 99999;
        $('.botnet-popup').remove();
        SugarCube.Engine.play(`${checkpoint.passage}`);
      });
    });

    $('.botnet-popup').append('<div id="botnet-cancel-btn">Cancel</div>');

    $('#botnet-cancel-btn').on('click', () => {
      $('.botnet-popup').remove();
    });
  });
}

function addRemoveButtonFunctionality() {
  const removeButton = document.querySelector('.remove-checkpoints');
  removeButton.addEventListener('click', () => {
    if (document.querySelector('.botnet-popup')) $('.botnet-popup').remove();

    $(document.body).prepend(
      '<div class="botnet-popup">' +
        '<div class="popup-text">Select which checkpoint you would like to remove:</div>' +
        '</div>',
    );

    const currentCheckpoints = [
      ...SugarCube.State.variables.checkpoints,
    ].reverse();

    currentCheckpoints.forEach((checkpoint) => {
      const checkpointLink = $(
        `<div class="botnet-checkpoint">${checkpoint.name}</div>`,
      );
      $('.botnet-popup').append(checkpointLink);

      $(checkpointLink).on('click', () => {
        SugarCube.State.variables.checkpoints =
          SugarCube.State.variables.checkpoints.filter(
            (savedCheckpoint) => savedCheckpoint.name !== `${checkpoint.name}`,
          );
        removeButton.click();
      });
    });

    $('.botnet-popup').append('<div id="botnet-cancel-btn">Close</div>');

    $('#botnet-cancel-btn').on('click', () => {
      $('.botnet-popup').remove();
    });
  });
}

function useFlexbox(passageElement) {
  passageElement.classList.add('use-flexbox');
  if (passageElement.attributes['data-passage'].value === 'Minor Chars') {
    passageElement.classList.add('fix-minor-chars');
  } else {
    const imgContainerNodes = document.querySelectorAll('.img-container1');
    if (imgContainerNodes) {
      $('.img-container1').remove();
      $('.passage').wrapInner('<div id="right-section"></div>');
      Array.from(imgContainerNodes)
        .reverse()
        .forEach((node) => {
          document.querySelector('.passage').prepend(node);
        });
    } else passageElement.classList.remove('use-flexbox');
    const regex = new RegExp(
      /DreamShopping062MobilegameStart[1-8]|DevinGiftShopVisit087DevinOrangeStart[2-8]/,
    );
    if (
      regex.test(
        document.querySelector('.passage').attributes['data-passage'].value,
      )
    ) {
      passageElement.classList.add('fix-flex-direction');
    }
  }
}

function bubbleChoices() {
  Array.from(document.querySelectorAll('.passage a')).forEach((link) => {
    $(link).addClass('bubble-this');
    if (link.previousElementSibling) {
      if (link.previousElementSibling.classList.contains('variable-text'))
        link.previousElementSibling.classList.add('bubble-this');
      $('.bubble-this').wrapAll('<div class="choice-bubble"></div>');
      $('.bubble-this').removeClass('bubble-this');
    } else {
      $('.bubble-this').wrapAll('<div class="choice-bubble"></div>');
      $('.bubble-this').removeClass('bubble-this');
    }
  });

  if (
    document.querySelector('.passage').attributes['data-passage'].value ===
    'Minor Chars'
  ) {
    Array.from(document.querySelectorAll('.choice-bubble')).forEach(
      (bubble) => {
        bubble.classList.add('fix-minor-char-bubble');
      },
    );
  }
}

function checkBrokenLinks() {
  Array.from(document.querySelectorAll('.passage a')).forEach((link) => {
    if (link.classList.contains('link-broken')) {
      $(link).removeClass('link-broken');
      $(link).unbind('click');
      $(link).append('<br>(Not yet implemented)');
    }
  });
}

function onPageLoad(passageElement) {
  initializeVariables();
  if (document.querySelector('.set-checkpoint')) {
    addSetButtonFunctionality();
    addLoadButtonFunctionality();
    addRemoveButtonFunctionality();
  }

  let updatePage = false;
  const links = document.querySelectorAll('.link-internal');
  Array.from(links).forEach((elem) => {
    if (elem.innerHTML == 'Update') updatePage = true;
  });

  if (!updatePage) {
    useFlexbox(passageElement);
    bubbleChoices();
  }

  checkBrokenLinks();
}

const docObserver = new MutationObserver((mutations, me) => {
  const passageElement = document.querySelector('.passage');
  if (passageElement && !passageElement.classList.contains('checked')) {
    passageElement.classList.add('checked');
    onPageLoad(passageElement);
  }
}).observe(document, { childList: true, subtree: true });
