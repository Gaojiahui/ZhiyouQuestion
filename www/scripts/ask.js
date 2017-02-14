
// 返回上一页
$("#goBack").click(function(){
	history.back();
})

//去注册
$("#home").click(function(){
	location.href="index.html";
})

// 提问问题
$("form").submit(function(event){
	// 阻止默认事件
	event.preventDefault();
	
	// var data = Formdata(this);  原生获取form数据方法
	var data = $(this).serialize();//  jquery的获取数据方法
	$.post('/question/ask',data,function(resData){
//		console.log(resData);
		$(".modal-body").text(resData.message);
		$("#myModal").modal('show')
		});
	});
	
	
