/* Tử Vi Thiên Lương — Trang Bài viết: danh sách, bộ lọc, bài chi tiết */
(function () {
  'use strict';

  var P = TVTLPosts;
  var $ = function (id) { return document.getElementById(id); };
  var listView = $('post-list'), artView = $('post-view');
  var filters = $('filters'), posts = $('posts');
  var logo = document.querySelector('.brand img').getAttribute('src');
  var cat = 'Tất cả';

  function renderFilters() {
    filters.innerHTML = P.CATS.map(function (c) {
      return '<button type="button" class="chip" aria-pressed="' + (c === cat) + '" data-c="' + P.esc(c) + '">' +
        P.esc(c) + '</button>';
    }).join('');
  }

  function renderList() {
    posts.innerHTML = P.POSTS
      .map(function (p, i) { return { p: p, i: i }; })
      .filter(function (x) { return cat === 'Tất cả' || x.p.cat === cat; })
      .map(function (x) { return P.cardHtml(x.p, x.i); })
      .join('');
  }

  filters.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    cat = b.dataset.c;
    renderFilters();
    renderList();
  });

  /** "#bai-<slug>" -> bài chi tiết; còn lại -> danh sách */
  function route() {
    var h = location.hash.slice(1);
    var p = h.indexOf('bai-') === 0 ? P.find(h.slice(4)) : null;
    if (p) {
      artView.innerHTML = P.articleHtml(p, logo);
      artView.hidden = false;
      listView.hidden = true;
      document.title = p.title + ' — Tử Vi Thiên Lương';
    } else {
      artView.hidden = true;
      listView.hidden = false;
      document.title = 'Bài viết — Tử Vi Thiên Lương';
      // hash trỏ tới bài không tồn tại -> dọn luôn để link chia sẻ không kẹt
      if (h.indexOf('bai-') === 0) history.replaceState(null, '', location.pathname);
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  renderFilters();
  renderList();
  route();
})();
