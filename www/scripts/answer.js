// 返回上一页
$("#goBack").click(function(){
	history.back();
});

//去注册
$("#home").click(function(){
	location.href="index.html";
});

// 从cookie中获取要回答问题的文件参数question(文件名)
// var question = $.cookie('question')
 $('form').submit(function(event){
 	event.preventDefault();
 	//var data = $(this).serializeArray();
 	var data = $(this).serialize();
 	$.post('/question/answer',data,function(resData){
 		$(".modal-body").text(resData.message);
 		$("#myModal").modal('show').on('hide.bs.modal',function(){
 			if (resData.code == 2) {
 				location.href = '/';
 			}
 		});
 	});
 });
