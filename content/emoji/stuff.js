/* global $, localStorage */
$(document).on('emoji:ready', function () {
  var hasFont = hasAppleColorEmoji()
  $('.input-search').focus()
  $('.loading').remove()

  if (!hasFont) {
    prepareTwemoji()
  }

  $(document).on('click', '.js-emoji', function (evt) {
    var node
    var text

    if (evt.shiftKey) {
      getSelection().removeAllRanges()
      var range = document.createRange()
      node = this.querySelector('.js-emoji-char')
      range.selectNodeContents(node)
      getSelection().addRange(range)

      text = hasFont ? node.textContent : node.querySelector('img').alt
    } else {
      node = this.querySelector('.js-emoji-code')
      node.select()
      text = node.value
    }

    document.execCommand('copy')
    alertCopied(text)
  })
})

function prepareTwemoji () {
  var twemojiScript = document.createElement('script')
  twemojiScript.src = '//twemoji.maxcdn.com/2/twemoji.min.js?2.2.3'
  twemojiScript.onload = function () {
    twemoji.parse(document.body)
    document.body.classList.add('twemojified')
  }
  document.head.appendChild(twemojiScript)
}

function alertCopied (emoji) {
  $('<div class=alert></div>').text('Copied ' + emoji).appendTo('body').fadeIn().delay(1000).fadeOut()
}

$.getJSON('./emojis.json', function (emojis) {
  var container = $('.emojis-container')
  Object.keys(emojis).forEach(function (key) {
    var emoji = emojis[key]
    if (emoji['category'] === '_custom') return

    var charHTML
    charHTML = '<span class="js-emoji-char native-emoji" title="' + key + '">' + emoji['char'] + '</span>'
    container.append(charHTML)
  })
  $(document).trigger('emoji:ready')
  $('.emojis-container').toggleClass('hide-text', localStorage.getItem('emoji-text-display') === 'false')
})

$(document).keydown(function (e) { focusOnSearch(e) })

$(document).on('click', '.js-hide-text', function () {
  $('.emojis-container').toggleClass('hide-text')
  var showorhide = $('.emojis-container').hasClass('hide-text') ? 'hide' : 'show'
  localStorage.setItem('emoji-text-display', !$('.emojis-container').hasClass('hide-text'))
  return false
})
