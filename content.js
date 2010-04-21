oncontextmenu = function(e) {
  if (!e.ctrlKey && !e.shiftKey && e.altKey) e.preventDefault(); else return;
  var img = e.target.localName == 'img' ? e.target.src
    : getComputedStyle(e.target, null).getPropertyValue('background-image');
  if ((img = img.replace(/^url\((.*)\)$/, "$1")) == 'none') return;

  // send the URL found to the main page
  chrome.extension.sendRequest({image: img});

  /*
  var dir = img.split('/');
  var tmp = document.body.appendChild(document.createElement('form'));
  tmp.action = 'http://www.pixlr.com/editor/';
  tmp.target = '_blank';
  [['image', img], ['title', dir[dir.length - 1]]].forEach(function(i) {
    var val = tmp.appendChild(document.createElement('input'));
    val.name = i[0];
    val.value = i[1];
  });
  tmp.submit();
  document.body.removeChild(tmp);
  */
};
