//滚动监听基于谷歌的前端框架materializecss实现
$(document).ready(function () {
    $('.scrollspy').scrollSpy(scrollOffset=1000);
});
//根据h2,h3,h4标签生成目录树
var hlist=$('.markdown-body h2,h3,h4');
var mytoc=$(".my-toc")
hlist.each(function () {
    //给h标签添加materializecss的class属性以实现滚动监听
    $(this).addClass("section scrollspy");
    //在"my-toc"标签中生成目录树
    if (this.tagName==="H2"){
        //锚连接
        var anchor='<a href=#'+this.id+'>'+$(this).text()+'</a>';
        //添加列表标签
        mytoc.append('<li>'+anchor+'</li>')
    }
    else {
        //子标签缩进
        var anchor='<a href=#'+this.id+'>&nbsp;&nbsp;'+$(this).text()+'</a>';
        mytoc.append('<li>'+anchor+'</li>')
    }
});

//实现小屏幕自动隐藏目录树
window.onresize=resizeBannerImage;//当窗口改变宽度时执行此函数
function resizeBannerImage()
{
    var winW = $(window).width();
    if( $(window).width() < 800 ) {
        mytoc.fadeOut(300);
        mytoc.attr("style","left:-10000px")
    }
    else{
        mytoc.attr("style","left:0");
        mytoc.show();
    }
}
//滚动到文章正文目录树出现
$(function () {
    //scroll 事件适用于所有可滚动的元素和 window 对象（浏览器窗口）。
    $(window).scroll(function () {
        var scroHei = $(window).scrollTop();//滚动的高度
        //窗口在文章封面处不显示目录树
        if (scroHei < 290) {
            mytoc.fadeOut(300);
        }
        //如果窗口滚动到正文则目录树出现
        else if (scroHei > 290 & scroHei < $(".post-content").height() + 290) {
            mytoc.fadeIn(300);
        }
        //窗口滚动到底部时目录树消失
        else {
            mytoc.fadeOut(300);
        }
    })
})