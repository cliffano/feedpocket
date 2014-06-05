App.populator('feed', function (page, data) {
  $(page).find('.app-title').text(data.title);
  $.getJSON('/data/feed/' + data.id + '/articles', function (articles) {
    articles.forEach(function (article) {
      var li = $('<li class="app-button">' + article.title + '</li>');
      li.on('click', function () {
        App.load('article', article);
      });
      $(page).find('.app-list').append(li);
    });
  });
});

App.populator('article', function (page, data) {
  $(page).find('.app-title').text(data.title);
  $.getJSON('/data/article/' + data.url, function (article) {
    $(page).find('.app-content').html(article.content);
  });
});