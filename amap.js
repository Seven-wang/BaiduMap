define(['src/js/common', 'src/js/core', 'src/js/dialog'], function(common, core) {
	core.onrender("amap", function(dom) {
		var hotelname = $DATA_MAP.hotelname;
		var hoteladdress = $DATA_MAP.address;
		var hotellng = $DATA_MAP.longitude;
		var phone = $DATA_MAP.phone;
		var hotellat = $DATA_MAP.latitude;
		//登陆验证方法
        var Amap = {
        	_hotelname : hotelname,
        	_hoteladdress : hoteladdress,
        	_hotellng : hotellng,
        	_phone : phone,
        	_hotellat : hotellat,
            init: function() {
            	if(typeof(AMap) == "undefined" || AMap == null){
                    $.dialog("地图加载失败，请刷新页面重试。", null,null);
                    return;
                }
            	console.log(typeof(AMap))
            	//初始化地图对象，加载地图
				var map = new AMap.Map("mapContainer",{
					resizeEnable: true,
					//二维地图显示视口
					view: new AMap.View2D({
						center:new AMap.LngLat(116.397428,39.90923),//地图中心点
						zoom:13 //地图显示的缩放级别
					})
				});		
				//添加点标记，并使用自己的icon
			
				var marker = new AMap.Marker({	
					//复杂图标
					icon: new AMap.Icon({    
							//图标大小
							size:new AMap.Size(28,37),
							//大图地址
							image:"http://webapi.amap.com/images/0.png", 
							imageOffset:new AMap.Pixel(0,0)
						}),
					//在地图上添加点
					position:new AMap.LngLat(116.480983,39.989628)
				});
				marker.setMap(map);  
				
				function openInfo(){
					//构建信息窗体中显示的内容
				    var info = []; 
					info.push("<div><div><img style=\"float:left;\" src=\" http://webapi.amap.com/images/autonavi.png \"/></div> "); 
					info.push("<div style=\"padding:0px 0px 0px 4px;\"><b>"+Amap._hotelname+"</b>");  
					info.push("电话 : "+Amap._phone);  
					info.push("地址 : "+Amap._hoteladdress+"</div></div>");  
				      
					infoWindow = new AMap.InfoWindow({  
						content:info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
					}); 
					infoWindow.open(map, new AMap.LngLat(116.480983,39.989628));
				}
				openInfo();
				 AMap.event.addListener(marker,'click',function(){ 
					 infoWindow.open(map,marker.getPosition());	
			   });	
            }
        };
		hotelname = Amap._hotelname;
		if($DATA_MAP.errorCode != "NOT_MAPINFO"){
        	Amap.init();
        }
    });
});