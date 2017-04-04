function main() {
    var app = {
        init: function() {
            this.circles = [];				// 储存创建的密码圆圈对象
            //this.pickedCircles = []; 		// 储存被选中圆圈
            this.password = '';		 		// 储存密码
            this.lastPass = '';             // 设置密码时，储存第一次输入的密码
            this.startCircle = null; 		// 储存当前路径的起始圆圈
            this.timer = null;              // 添加一个全局的计时器
            this.info = document.getElementsByClassName('info')[0];           // 提示信息文本框
            this.eleSet = document.getElementsByClassName('set')[0];          // 设置按钮
            this.eleVali = document.getElementsByClassName('validate')[0];    // 验证按钮
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 240;
            this.canvas.height = 240;
            this.createCircles();			// 创建小圆圈
            this.draw();    				// 绘制初始图形
            this.bindEvent();				// 绑定事件
        },

        createCircles: function() {
            var x = 20,
                y = 20;
            //创建9个小圆圈
            for (var i = 0; i < 9; i++) {
                var aCircle = {
                    x: x,
                    y: y,
                    r: 19
                };
                this.circles[i] = aCircle;
                if (x + 100 <= 240) {
                    x += 100;
                } else {
                    x = 20;
                    y += 100;
                }
            }
        },

        bindEvent: function() {
            this.canvas.addEventListener('touchstart', this.startEvent.bind(this));
            this.canvas.addEventListener('touchmove', this.moveEvent.bind(this));
            this.canvas.addEventListener('touchend', this.endEvent.bind(this));
            this.eleSet.addEventListener('click', function() {      // 这里必须用click，因为label标签传递给内部input标签的是click事件
                clearTimeout(this.timer);
                this.info.innerText = "请输入手势密码";
            }.bind(this));
            this.eleVali.addEventListener('click', function() {
                this.lastPass = '';                                 //  BUG修复，切换必须重置状态
                clearTimeout(this.timer);
                this.info.innerText = "请输入手势密码";
            }.bind(this));
        },

        draw: function(e) {
            // 判断是初始化调用该方法还是事件调用
            if (e) {
                this.ctx.clearRect(0, 0, 300, 300); // 清空所有绘制
                e.preventDefault();
            }

            for (var i = 0; i < this.circles.length; i++) {      // 初始图形的绘制
                this.ctx.beginPath();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#bbb';
                this.ctx.fillStyle = '#fff';
                this.ctx.arc(this.circles[i].x, this.circles[i].y, this.circles[i].r, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        },

        moveEvent: function(e) {
            e.preventDefault();
            this.draw(e);       //重绘图案，主要是清除上一次移动绘制的线条
            var x = e.changedTouches[0].clientX - this.canvas.getBoundingClientRect().left;  // 计算当前手指相对画布的x坐标
            var y = e.changedTouches[0].clientY - this.canvas.getBoundingClientRect().top;   // 计算当前手指相对画布的y坐标
            this.drawDetect(x, y);
            if(this.password.length < 9){       // 超过9个就不允许再移动线条了
                if(this.startCircle) {          // 有起始点才开始
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startCircle.x, this.startCircle.y);
                    this.ctx.lineTo(x, y);
                    this.ctx.strokeStyle = "#DF3134";
                    this.ctx.stroke();
                }
            }     
        },

        startEvent: function(e) {
            e.preventDefault();
            var x = e.changedTouches[0].clientX - this.canvas.getBoundingClientRect().left;
            var y = e.changedTouches[0].clientY - this.canvas.getBoundingClientRect().top;
            this.drawDetect(x, y);
        },

        endEvent: function(e) {
            e.preventDefault();
            var _this = this;                            // 用变量来储存this,通过timeout函数中形成的闭包调用       
            if(this.eleSet.checked){                     // 设置状态
                var count = this.password.length;        // 统计有多少个圆圈被选择了        
                if(this.lastPass === ''){                // 如果是第一次输入
                    if( count > 0 && count < 5) {        // 如果密码长度不够 && 交互改进！一个点都没点到还是不要提示了，添加>0判断
                       clearTimeout(this.timer);         // BUG修复，要先清除计时器     
                       this.info.innerText = "密码太短，至少需要5个点";  // 交互改进！只有第一次输入太短会提示太短，第二次就算太短还是提示输入不一致，遵循交互设计的一致性原则      
                       this.timer = setTimeout(function(){               // 重置提示
                            _this.info.innerText = '请输入手势密码';
                        } , 2000);
                    } else {                             // 密码长度够
                          clearTimeout(this.timer);
                          this.info.innerText = "请再次输入手势密码";
                          this.lastPass = this.password;
                    }  
                }  else {                                  // 如果是第二次输入
                    if(this.lastPass === this.password) {
                        clearTimeout(this.timer);
                        this.info.innerText = '密码设置成功';
                        localStorage.setItem('__password__',this.password);   // 用localStorage获取密码
                        this.lastPass = '';
                    }  else {
                        clearTimeout(this.timer);
                        this.info.innerText = "两次输入的不一致";
                        this.lastPass = '';
                        this.timer = setTimeout(function(){                 // 重置提示
                             _this.info.innerText = '请输入手势密码';
                         } , 2000);
                    }       
                }          
            } else if (this.eleVali.checked) {                   // 验证状态
                if(!localStorage.getItem('__password__')) {      // 密码未设置
                    clearTimeout(this.timer);
                    this.info.innerText = "密码未设置，请先设置密码！";
                } else {
                    var savedPass = localStorage.getItem('__password__');     // 用localStorage储存密码
                    if(savedPass === this.password) {
                        clearTimeout(this.timer);
                        this.info.innerText = "密码正确！";
                    } else {
                        clearTimeout(this.timer);
                        this.info.innerText = "输入的密码不正确！";
                        this.timer = setTimeout(function(){                 // 重置提示
                             _this.info.innerText = '请输入手势密码';
                         } , 2000);
                    }
                }
            }      
            this.password = "";            //重置状态
            this.startCircle = null;
            this.draw(e);
        },

        drawDetect: function(x, y) {
        	/* 
        	   判断当前手指是否在圆圈内，如果在，将当前圆圈设置为起始圆圈startCircle，更新password，
        	   在更新password的过程中，对用户在输入手势时走折线，跨过某些圆圈的特殊情况进行处理。
        	*/
            var i;
            for (i = 0; i < this.circles.length; i++) {
        		var curX = this.circles[i].x;   					//遍历到的当前圆圈的x坐标
            	var curY = this.circles[i].y;						//遍历到的当前圆圈的y坐标
                this.ctx.beginPath();
                this.ctx.arc(this.circles[i].x, this.circles[i].y, this.circles[i].r, 0, Math.PI * 2);
                if (this.ctx.isPointInPath(x, y)) {          		 //判断手指是否在某个圆圈内
                    if (this.password.length === 0) {
                    	this.password += i;
                        this.startCircle = this.circles[i];          //切换startCircle
                    } else {
                    	var len = this.password.length;
                    	var lastIndex = +this.password[len - 1];     //转换为数字
                    	var lastX = this.circles[lastIndex].x;
                    	var lastY = this.circles[lastIndex].y;
                    	if(curX === lastX && Math.abs(curY - lastY) === 200) {
                		  	 	// 两者在同一竖排且跨越一行
                    		if(curY > lastY) {
                    			//两者在同一竖排，且新被选中的圆圈在最后一横排，之前被选中的在第一横排,也就是需要额外考虑夹在中间的索引为i-3的圆圈
                    			if(this.password.indexOf(i) === -1 && this.password.indexOf(i - 3) === -1) {     //判断重复
                    				this.password += (i - 3);
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle

                    			} else if(this.password.indexOf(i) === -1) {
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle
                    			} else if(this.password.indexOf(i - 3) === -1) {
                                    this.password += (i - 3);
                                    this.startCircle = this.circles[i - 3];
                                } 
                    		} else if(curY < lastY) {
                    			//两者在同一竖排，且新被选中的圆圈在第一横排，之前被选中的在最后一横排,也就是需要额外考虑夹在中间的索引为i+3的圆圈
                    			if(this.password.indexOf(i) === -1 && this.password.indexOf(i + 3) === -1) {     //判断重复
                    				this.password += (i + 3);
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle

                    			} else if(this.password.indexOf(i) === -1) {
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle
                    			} else if(this.password.indexOf(i + 3) === -1) {
                                    this.password += (i + 3);
                                    this.startCircle = this.circles[i + 3];
                                }  
                    		}
                    	} else if(curY === lastY && Math.abs(curX - lastX) === 200) {
                    			// 两者在同一横排且跨越一列
                    		if(curX > lastX) {
                    			//两者在同一横排，且新被选中的圆圈在最后一竖排，之前被选中的在第一竖排,也就是需要额外考虑夹在中间的索引为i-1的圆圈
                    			if(this.password.indexOf(i) === -1 && this.password.indexOf(i - 1) === -1) {     //判断重复
                    				this.password += (i - 1);
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle

                    			} else if(this.password.indexOf(i) === -1) {
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle
                    			} else if(this.password.indexOf(i - 1) === -1) {
                                    this.password += (i - 1);
                                    this.startCircle = this.circles[i - 1];
                                }
                    		} else if(curX < lastX) {
                    			//两者在同一横排，且新被选中的圆圈在第一竖排，之前被选中的在最后一竖排,也就是需要额外考虑夹在中间的索引为i+1的圆圈
                    			if(this.password.indexOf(i) === -1 && this.password.indexOf(i + 1) === -1) {     //判断重复
                    				this.password += (i + 1);
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle

                    			} else if(this.password.indexOf(i) === -1) {
                    				this.password += i;
                                    this.startCircle = this.circles[i];              //切换startCircle
                    			} else if(this.password.indexOf(i + 1) === -1) {
                                    this.password += (i + 1);
                                    this.startCircle = this.circles[i + 1];
                                } 
                    		}
                    	} else if(Math.abs(curX - lastX) === 200 && Math.abs(curY - lastY) === 200) {
                    		// 两者在对角情况相对简单，都是要额外考虑正中间，也就是索引为4的那个圆圈
                    		if(this.password.indexOf(i) === -1 && this.password.indexOf(4) === -1) {     //判断重复
                    			this.password += 4;
                    			this.password += i;
                                this.startCircle = this.circles[i];              // 切换startCircle

                    		} else if(this.password.indexOf(i) === -1) {
                    			this.password += i;
                                this.startCircle = this.circles[i];              // 切换startCircle
                    		} else if(this.password.indexOf(4) === -1) {
                                this.password += 4;
                                this.startCircle = this.circles[4];
                            }  
                    	} else {                                                 // 一般情况
                    		if(this.password.indexOf(i) === -1) {
                    			this.password += i;
                                this.startCircle = this.circles[i];              // 切换startCircle
                    		}
                    	}
                    }
                }
            }

            this.repaint();
        },

        repaint: function() {
        	var i;
        	for (i = 0; i < this.password.length; i++) {           // 将已被选中圆圈重新绘制上并变色！
        	    var passIndex = this.password[i];
        	    this.ctx.beginPath();
        	    this.ctx.fillStyle = "#ffa723";
        	    this.ctx.strokeStyle = "#fd9102";
        	    this.ctx.arc(this.circles[passIndex].x, this.circles[passIndex].y, this.circles[passIndex].r, 0, Math.PI * 2);
        	    this.ctx.fill();
        	    this.ctx.stroke();      	    
        	}
            for (i = 0; i < this.password.length; i++) {            // 重新绘制线条！
                var index = this.password[i];
                if (i === 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.circles[index].x,this.circles[index].y);
                    this.ctx.strokeStyle = "#DF3134";
                }
                else {
                    this.ctx.lineTo(this.circles[index].x, this.circles[index].y);
                }
                this.ctx.stroke();
            }
        }
    };
    return app.init();
}
