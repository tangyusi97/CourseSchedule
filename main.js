// 获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);    //匹配目标参数
  if (r != null) return decodeURI(r[2]); return null;     //返回参数值
}

$(function($) {
  // 获取周次
  let WEEK = 1;
  const now = new Date();
  const Monday = Math.round(now.getTime()/1000) - (now.getDay()-1)*3600*24;
  const monday = getUrlParam('timestamp');
  if (monday) WEEK = Math.round((Monday - monday)/3600/24/7) + 1;

  $('#week').on('change', () => {
    $('#tab1Content').hide();
    $('.weui-loadmore').show();
    WEEK = $('#week').val();
    render(DATA);
  });

  $('#setWEEK').on('click', function() {
    $(this).swipeout('close');
    const setTime =  Monday - (WEEK - 1)*7*24*3600;
    location.href = location.origin + location.pathname + '?timestamp=' + setTime;
  })

  const weekTpl = _.template(`<% _.forEach(term, (n, i) => { %><option value='<%= i+1 %>'>第<%= i+1 %>周</option><% }); %>`);
  const AllLessonListTpl = _.template(`<% _.forEach(list, lesson => { %>
                                      <div class="weui-media-box weui-media-box_text">
                                        <h4 class="weui-media-box__title"><%- lesson.name %></h4>
                                        <p class="weui-media-box__desc"><%- lesson.time %> @<%- lesson.location %></p>
                                        <p class="weui-media-box__desc"><%- lesson.teacher %> | <%- lesson.periods %>学时 <%- lesson.exam %> <%- lesson.class %></p>
                                      </div>
                                    <% }); %>`);
  // 获取数据
  let DATA = {};
  const NAME = (getUrlParam('name') || 'schedule');
  $.getJSON('./json/'+NAME+'.json')
    .done(data => {
      DATA = data;
      if (WEEK > data.givenLessons.length || WEEK < 1) {
        alert('参数有误！');
        location.href = location.origin + location.pathname;
      }
      $('#week').html(weekTpl({term: data.givenLessons}));
      $('#week option[value="'+WEEK+'"]').attr('selected', true).append('（本周）');
      $('#lessonList').html(AllLessonListTpl({list: data.lessonList}));
      $('#lessonList').prev().text('所有课程列表（共 '+data.lessonList.length+' 门课）')
    })
    .fail(() => {
      alert('参数有误！');
      location.href = location.origin + location.pathname;
    })
    .done(render);


  // 渲染页面
  const givenLessonTpl = [
    _.template(`<tr>
                  <th class="text-center" scope="row">12</th>
                  <% _.forEach(lessons, weekLessons => { %><td><%- weekLessons[0].name %> @<%- weekLessons[0].location %></td><% }); %>
                </tr>`),
    _.template(`<tr>
                  <th class="text-center" scope="row">34</th>
                  <% _.forEach(lessons, weekLessons => { %><td><%- weekLessons[1].name %> @<%- weekLessons[1].location %></td><% }); %>
                </tr>`),
    _.template(`<tr>
                  <th class="text-center" scope="row">56</th>
                  <% _.forEach(lessons, weekLessons => { %><td><%- weekLessons[2].name %> @<%- weekLessons[2].location %></td><% }); %>
                </tr>`),
    _.template(`<tr>
                  <th class="text-center" scope="row">78</th>
                  <% _.forEach(lessons, weekLessons => { %><td><%- weekLessons[3].name %> @<%- weekLessons[3].location %></td><% }); %>
                </tr>`),
  ];
  const costomedLessonTpl = _.template(`<% _.forEach(lessons, lesson => { %>
                                          <div class="weui-cell">
                                            <div class="weui-cell__bd">
                                              <p><%- lesson.name %></p>
                                            </div>
                                            <div class="weui-cell__ft"><%- lesson.teacher %></div>
                                          </div>
                                        <% }); %>`);

  function render(data) {
    if (!data) return false;

    $('.weui-loadmore').hide();

    $('#scheduleTable tbody').html((
      givenLessonTpl[0]({lessons: data.givenLessons[WEEK]}) +
      givenLessonTpl[1]({lessons: data.givenLessons[WEEK]}) +
      givenLessonTpl[2]({lessons: data.givenLessons[WEEK]}) +
      givenLessonTpl[3]({lessons: data.givenLessons[WEEK]})
        ).replace(/<td> @<\/td>/g, '<td></td>'));
    $('#costomedLessonList').html(costomedLessonTpl({lessons: data.customedLessons}));
    $('#tab1Content').show();
  }
});