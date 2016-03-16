define(['src/js/common', 'src/js/core', 'src/js/dialog'], function(common, core,dialog) {
	core.onrender("map", function(dom) {
        var htmltype = $("html").attr("class");
        //登陆验证方法
        var DetailMapClient = {
            _mylng:0,//个人经度
            _mylat:0,//个人纬度
            _map: null,
            _ghotelpoint: null,
            _bhotelpoint: null,
            _local: null,
            _currentposition: null,
            _transit: null,
            _range: 3000,
            _isload:null,
            _tranfficinfo:null,
            _istransit: null,
            _rresult:null,
            _sresult:null,
            _tranff:null,
            _defaultzoom:null,
            _isopenzoom:null,
            Init: function () {
                slark.get("map").startLoading();
                if(typeof(BMap) == "undefined" || BMap == null ){
                    slark.get("map").stopLoading();
                    dialog.alert("地图加载失败，请刷新页面重试。");
                    return;
                }
                DetailMapClient._range = 3000;
                DetailMapClient._isload = false;
                DetailMapClient._defaultzoom = 15;
                DetailMapClient._istransit = "True";
                DetailMapClient._isopenzoom = "False";
                DetailMapClient._tranfficinfo = {keyword: "交通",Lh: []};
                DetailMapClient._tranfficinfo.length = 0;
                DetailMapClient._rresult = "";
                DetailMapClient._sresult = "";
                DetailMapClient._tranff = "";

                DetailMapClient._tranfficinfo.Lh.push({title:"南苑机场",point:{lng:116.3951,lat:39.80254}});
                DetailMapClient._tranfficinfo.Lh.push({title:"北京南站（火车站）",point:{lng:116.379,lat:39.86522}});
                DetailMapClient._tranfficinfo.Lh.push({title:"北京北站",point:{lng:116.3538,lat:39.94276}});
                DetailMapClient._tranfficinfo.Lh.push({title:"首都国际机场3号航站楼",point:{lng:116.6147,lat:40.05623}});
                DetailMapClient._tranfficinfo.Lh.push({title:"首都国际机场",point:{lng:116.5921,lat:40.0754}});
                DetailMapClient._tranfficinfo.Lh.push({title:"北京西站（火车站）",point:{lng:116.322,lat:39.89541}});
                DetailMapClient._tranfficinfo.Lh.push({title:"北京站（火车站）",point:{lng:116.427,lat:39.9024}});
                DetailMapClient._tranfficinfo.Lh.push({title:"首都机场",point:{lng:116.592,lat:40.07538}});

                DetailMapClient._map = new BMap.Map("map");
                this.InitHotel();

                //定位
                $(dom).on("click", ".myid", function() {
                    DetailMapClient.FixedPosition();
                });
                $(dom).on("click", ".pupop li", function() {
                    if(!$(this).hasClass("myid") && !$(this).hasClass("on")){
                        $(".pupop li").removeClass("on")
                        $(this).addClass("on")
                    }
                });
                $(dom).on("click", "#restaurant", function() {
                    DetailMapClient.SearchRestaurant();
                });
                $(dom).on("click", "#scenic", function() {
                    DetailMapClient.SearchScenic();
                });
                $(dom).on("click", "#transport", function() {
                    DetailMapClient.SearchTransport();
                });
            },
            InitHotel: function (zoom) {
                if(typeof(zoom) == "undefined" || zoom == null){
                    zoom = DetailMapClient._defaultzoom;
                }
                var lng,lat;
                lng = $DATA_MAP.longitude;
                lat = $DATA_MAP.latitude;
                if($DATA_MAP.errorCode == "NOT_MAPINFO"){
                    dialog.log("酒店地图经纬度错误。");
                    return;
                }
                if(lat >= 3 && lat <= 54 && lng >= 73 && lng <= 136){                
                }
                else{
                    dialog.log("酒店地图经纬度错误。");
                    return;
                }
                /*默认天安门的经纬度*/
                if(lng == null || lng == 0 || lat == null || lat == 0){
                    lng = 116.3972282409668;
                    lat = 39.90960456049752;
                }
                DetailMapClient._ghotelpoint = new BMap.Point(lng,lat);
                this.G2BPoint(DetailMapClient._ghotelpoint,function(point){
                    point.lng = DetailMapClient._ghotelpoint.lng;
                    point.lat = DetailMapClient._ghotelpoint.lat;
                    DetailMapClient._bhotelpoint = point;
                    DetailMapClient._map.enablePinchToZoom(); 
                    DetailMapClient._map.centerAndZoom(DetailMapClient._bhotelpoint, zoom);
                    var marker = DetailMapClient.AddHotelMarker(DetailMapClient._bhotelpoint);
                    DetailMapClient._isload = true;
                    slark.get("map").stopLoading();
                    DetailMapClient._local = new BMap.LocalSearch(DetailMapClient._map, {
                        onSearchComplete: function (result) {
                            DetailMapClient.InitMarker(result);
                            slark.get("map").stopLoading();
                        }
                    });
                }); 
            },
            InitMarker: function (result) {
                if (typeof (result) != "undifined" && result != null) {
                    var icon = null;
                    var size = null;
                    var pois = null;
                    var distance = null;
                    var content = "";
                    var msg = "未找到结果";
                    size = new BMap.Size(32, 32);
                    if (result.keyword == "餐饮") {
                        icon = "../img/eat.png";
                        msg = "未找到匹配的美食位置";
                        _rresult = result;
                    }
                    else if (result.keyword == "景点") {
                        icon = "../img/view.png";
                        msg = "未找到匹配的景点位置";
                        _sresult = result;
                    }
                    else if(result.length != "undefined"){
                        icon = "../img/bus.png";
                        msg = "未找到匹配的交通枢纽";
                        _tranff = result
                    }
                    else {
                        return;
                    }

                    var s = [];
                    if(result.length != undefined){
                        for (var t = 0; t < 6; t ++){
                            var resultt = result[t]
                            for (var i = 0; i < resultt.getCurrentNumPois(); i ++){
                                s.push(resultt.getPoi(i));
                            }
                        }
                    }else{
                        var s = [];
                        for (var i = 0; i < result.getCurrentNumPois(); i ++){
                            s.push(result.getPoi(i));
                        }
                    }
                    result.Lh = s;
                    if(typeof(result) == "undefined" || result == null || result.Lh == null || result.Lh.length <=0){
                        dialog.alert(msg);
                        slark.get("map").stopLoading();
                    }
                    pois = result.Lh;
                    var mindis = 0;
                    for (var i = 0; i < pois.length; i++) {
                        distance = DetailMapClient._map.getDistance(DetailMapClient._bhotelpoint, pois[i].point);
                        if(i == 0)
                            mindis = distance;
                        else{
                            if(mindis > distance)
                                mindis = distance;
                        }
                        pois[i].distance = distance;
                    }
                    for (var i = 0; i < pois.length; i++) {
                        distance = pois[i].distance;
                        content = "<div style='line-height:20px;font-size:12px;overflow:hidden;'><b>" + pois[i].title + "</b>";
                        content = this.ConcatString(content,Math.round(distance),"<br><b>距离:</b>" + Math.round(((distance)/1000)*10)/10 + "公里</div>");
                        if(distance == mindis)
                        {
                            this.AddIcon(icon, size, pois[i].point, content,true);
                        }
                        else
                            this.AddIcon(icon, size, pois[i].point, content);
                    }
                }
            },
            FixedPosition: function () {
                /*定位城市*/// 百度地图API功能
                slark.get("map").startLoading();
                
                DetailMapClient._map.centerAndZoom(DetailMapClient._ghotelpoint,15);      

                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function(r){
                    if(this.getStatus() == BMAP_STATUS_SUCCESS){
                        var mk = new BMap.Marker(r.point);
                        DetailMapClient._map.addOverlay(mk);
                        DetailMapClient._map.panTo(r.point);
                        slark.get("map").stopLoading();
                        DetailMapClient._mylng = r.point.lng
                        DetailMapClient._mylat = r.point.lat
                        DetailMapClient.ShortestRoute();
                    }
                    else {
                        slark.get("map").stopLoading();

                        switch (this.getStatus()) {
                            case 2:
                                dialog.alert("手机未能成功定位，可能是信号问题或手机未启用GPS 。请开启GPS并到户外重试。");
                                break;
                            case 3:
                                dialog.alert("导航结果未知，请刷新页面并重试");
                                break;
                            case 4:
                                dialog.alert("非法密钥，请刷新页面并重试");
                                break;
                            case 5:
                                dialog.alert("非法请求，请刷新页面并重试");
                                break;
                            case 6:
                                var authError = "手机未能成功定位，可能您曾拒绝使用您的地理位置信息。";
                                if ( htmltype == 'android' ) {
                                    authError += "请在“系统设置”中开启“位置服务”后刷新页面并重试。";
                                }
                                else {
                                    authError += "请在系统“设置>隐私”中开启浏览器“定位服务”或“设置>通用”中“还原位置与隐私”并重试。";
                                }
                                dialog.alert(authError);
                                break;
                            case 7:
                                dialog.alert("该设备或者浏览器不支持定位功能");
                                break;
                            case 8:
                                dialog.alert("请求超时，请刷新页面并重试");
                                break;
                        }
                    }        
                },{enableHighAccuracy: true})
                //关于状态码
                //BMAP_STATUS_SUCCESS   检索成功。对应数值“0”。
                //BMAP_STATUS_CITY_LIST 城市列表。对应数值“1”。
                //BMAP_STATUS_UNKNOWN_LOCATION  位置结果未知。对应数值“2”。
                //BMAP_STATUS_UNKNOWN_ROUTE 导航结果未知。对应数值“3”。
                //BMAP_STATUS_INVALID_KEY   非法密钥。对应数值“4”。
                //BMAP_STATUS_INVALID_REQUEST   非法请求。对应数值“5”。
                //BMAP_STATUS_PERMISSION_DENIED 没有权限。对应数值“6”。(自 1.1 新增)
                //BMAP_STATUS_SERVICE_UNAVAILABLE   服务不可用。对应数值“7”。(自 1.1 新增)
                //BMAP_STATUS_TIMEOUT   超时。对应数值“8”。(自 1.1 新增)
            },
            //最短时间行车路线
            ShortestRoute: function(){
                DetailMapClient._map.centerAndZoom(DetailMapClient._ghotelpoint,15);      
                var p1 = new BMap.Point(DetailMapClient._mylng,DetailMapClient._mylat);
                var p2 = new BMap.Point(DetailMapClient._bhotelpoint.lng,DetailMapClient._bhotelpoint.lat);

                //var p1 = new BMap.Point(116.50173719103,39.982826418485);
                //var p2 = new BMap.Point(116.4169884307,39.915544798768);

                var driving = new BMap.DrivingRoute(DetailMapClient._map, {renderOptions:{map: DetailMapClient._map, autoViewport: true}});
                driving.search(p1, p2);
            },
            SearchRestaurant: function () {
                slark.get("map").startLoading();
                this.Clear(DetailMapClient._defaultzoom);
                DetailMapClient._map.centerAndZoom(DetailMapClient._bhotelpoint, DetailMapClient._defaultzoom);
                if(DetailMapClient._rresult != ""){
                    DetailMapClient.InitMarker(DetailMapClient._rresult);
                    slark.get("map").stopLoading();
                }
                else{
                    DetailMapClient._local.searchNearby("餐饮", DetailMapClient._bhotelpoint, DetailMapClient._range);
                }
            },
            SearchScenic: function () {
                slark.get("map").startLoading();
                this.Clear(DetailMapClient._defaultzoom);
                DetailMapClient._map.centerAndZoom(DetailMapClient._bhotelpoint, DetailMapClient._defaultzoom);
                if(DetailMapClient._sresult != ""){
                    DetailMapClient.InitMarker(DetailMapClient._sresult);
                    slark.get("map").stopLoading();
                }
                else{
                    DetailMapClient._local.searchNearby("景点", DetailMapClient._bhotelpoint, DetailMapClient._range);
                }
            },
            SearchTransport: function () {
                slark.get("map").startLoading();
                this.Clear(DetailMapClient._defaultzoom);
                DetailMapClient._map.centerAndZoom(DetailMapClient._bhotelpoint, DetailMapClient._defaultzoom);
                if(DetailMapClient._tranff != ""){
                    DetailMapClient.InitMarker(DetailMapClient._tranff);
                    slark.get("map").stopLoading();
                }
                else{

                    var myKeys = ["公交", "汽车站","火车站","港口","机场","交通枢纽"];

                    DetailMapClient._local.searchNearby(myKeys, DetailMapClient._bhotelpoint, DetailMapClient._range);
                }
            },
            AddHotelMarker: function (point) {
                var marker = new BMap.Marker(point);
                var content,hotelname,address,phone;
                //hotelname = "北京饭店";
                //address = "东城区东长安街33号(地铁王府井站A口西侧)";
                //phone = "010-65137766";
                content = "<div style='line-height:20px;font-size:12px;overflow:hidden;'><h1>"+$DATA_MAP.hotelname+"</h1><p>"+$DATA_MAP.address+"</p>";
                if (typeof (content) != "undefined" && content != null) {
                    var label = new BMap.Label("hotelname", { offset: new BMap.Size(20, -10) });
                    marker.setLabel(label);
                    if(DetailMapClient._isload)
                        this.AddIcon("../img/map_hotel.png",new BMap.Size(32,32),point,content)
                    else
                        this.AddIcon("../img/map_hotel.png",new BMap.Size(32,32),point,content,true);
                }
                return marker;
            },
            AddIcon: function (icon, size, point, content,isopeniw) {
                var Icon = new BMap.Icon(icon, size);
                var marker = new BMap.Marker(point, { icon: Icon }); 
                DetailMapClient._map.addOverlay(marker);              
                var iw = this.CreateInfoWindow(content);
                marker.addEventListener("click",function () { this.openInfoWindow(iw); });
                marker.addEventListener("infowindowopen",function(){
                        var cimg = $("[src='http://api.map.baidu.com/images/iw_close1d3.gif']");
                        cimg.attr("src","../img/iconClose.png");
                        cimg.attr("style","position: absolute; top: 2px; width: 30px; height: 30px; cursor: pointer; z-index: 10; left: 219px !important;");
                    });
                if(isopeniw){
                    setTimeout(function(){
                        DetailMapClient._map.centerAndZoom(point, DetailMapClient._defaultzoom);
                        marker.openInfoWindow(iw);
                    }
                    ,200);
                }
            },
            CreateInfoWindow: function (content) {
                var iw = new BMap.InfoWindow(content);
                iw.setWidth(220);
                return iw;
            },
            G2BPoint: function (point,callback) {
                BMap.Convertor.translate(point,2,callback);
            },
            Clear: function (zoom) {
                DetailMapClient._map.clearOverlays();
                this.InitHotel(zoom);
            },
            Reset: function(zoom){
                DetailMapClient._isload = false;
                this.Clear(zoom);
            },
            ConcatString: function(str,checkstr,childstr){
                if(typeof(checkstr) != "undefined" && checkstr != null && checkstr != ""){
                    str = str + childstr;
                }
                return str;
            }
        };


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

        if($DATA_MAP.mapType == "baidumap"){
            window.init = function(){
                if($DATA_MAP.errorCode != "NOT_MAPINFO"){
                    DetailMapClient.Init();
                }
            }

            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://api.map.baidu.com/api?v=1.4&callback=init";
            document.body.appendChild(script);
        }
        else{
            hotelname = Amap._hotelname;
            if($DATA_MAP.errorCode != "NOT_MAPINFO"){
                Amap.init();
            }
        }
    });
});