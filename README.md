# 写在前面

此项目来源于360前端星计划作业，制作一个手势密码，项目的配色和大部分的交互方案是依照作业要求里示意图的配色和交互方案来制作的。如果您觉得配色方案或者交互方案比较low,本人表示不背锅哈哈哈哈。


__注：此项目属于学习项目，并非商业项目，代码上可能有很多不严谨的地方，请多担待。__



# 技术栈
纯原生JS完成，不依赖任何第三方库，项目运行方案2依赖node.js+express。

# 功能实现
- [x] canvas实现手指触摸动画 -- 完成
- [x] 密码设置功能 -- 完成
- [x] 密码记忆储存功能 -- 完成
- [x] 密码验证功能 -- 完成

# 项目运行

**如果你选择下载本项目，将文件解压后，有两种运行方式：**

### 一、使用谷歌浏览器在PC端运行：

步骤：

1.	用浏览器打开dist目录下的index.html

2.	打开开发者工具，调成移动端开发模式。（必须使用移动端开发模式，因为项目的使用环境是安卓和IOS系统的手机，所以为了在手机上体验更顺畅，事件的设定基于移动端，使用的是touch事件）


### 二、在PC启动一个服务器，在手机上测试：

步骤：

1.	打开命令行，到达文件目录，输入npm install 安装完依赖模块后，运行node 
dev_server（需要node.js）启动PC端的服务器。

2.	输入ipconfig记录下本机无线局域网适配器的ip地址。（如172.28.100.1）

3.	让手机和PC连入一个局域网，打开手机浏览器，手动输入ip:8080（如 http://172.28.100.1:8080/ ）。或者在PC端打开草料二维码生成器网址: http://cli.im/ 输入ip:8080生成二维码，打开手机浏览器扫描该二维码亦可。


**如果你懒得下载本项目，直接想运行玩一玩，更便捷的方式就是点击下面的连接咯！**

### 三、点击下面的链接！

[手机手势密码demo](https://zzxboy1.github.io/360h5star/dist/)

请打开谷歌浏览器的移动端开发模式查看！！O(∩_∩)O~~




# 项目布局
```
|--  dist文件夹
|-- 	css文件夹
		|--	style.css  	    // 样式文件
	|--  js 文件夹 
		|--	page.js 	    //  js文件
	|--  index.html  	            // 页面文件
|--	dev_server.js                       // 服务器配置
|--	package.json                        // 项目依赖配置文件
|--	README.md                           // 说明

```

# 模块划分

page.js文件被封装在一个main函数中，返回一个app对象的init()方法。为了方便阅读和自己的调试，我将代码一共分为了9个模块分别为:

1、	init模块：初始化对象属性：包括储存密码圆圈对象的circles数组；储存密码的password字符串；记录上次密码的lastPass字符串；当前路径起始圆圈的startCircle对象；一个全局计时器timer以及部分DOM对象。并对canvas进行初始化，绘制页面初始状态，绑定事件。

2、	createCircles模块：创建9个小圆圈，通过视觉测试和部分手机的兼容测试，决定将半径设为40px,两个圆圈上下左右之间，间隔60px，所以画布宽高计算为40*3+60*2=240px。将9个小圆圈用Circle对象保存。

3、	bindEvent模块：给canvas，单选框绑定事件。

4、	draw模块：绘制9个圆圈的初始状态，即9个白底灰边的圆圈，无任何线条的状态。

5、	moveEvent模块：手指移动过程中touchmove事件handler，首先调用draw()
模块方法重置画布，进行手指位置检测，调用drawDetect模块检测手指是否在某个圆圈中。

6、	startEvent模块：touchstart事件的handler，调用drawDetect()模块方法，判断起始点是否在圆圈内。

7、	endEvent模块：touchend事件的handler，对move过程中生成的password进行分析，如果是设置状态，且当前是第一次设置，则将密码储存到lastPass中。第二次则将密码与lastPass对比，判断更新localStorage或者警告两次输入不一致。如果是验证状态，则与localStorage中的储存对比。并将画布及password、startCircle属性重置。

8、	drawDetect模块：检测手指是否在某个圆圈中，如果是，更新password，更改当前的startCircle，调用repaint()模块方法。

9、	repaint模块：将记录的状态包括手指移动产生的线条进行绘制以及经过的圆圈进行换色处理。

# 交互细节的处理

首先在错误提示信息如“输入密码不正确”、“密码太短请重新输入”显示后，添加一个全局计时器timer，添加这个计时器是为了让提示信息返回到“请输入手势密码上”这样用户可以更加清晰的知道，前面的输入已经无效了，需要重新输入，而不是让错误信息一直呈现，让用户持续等待而不知道下一步该做什么，影响用户体验。同时在每次重新验证或者设置以及切换验证和设置状态时，都会清除这个计时器，防止在更换状态后，提示信息会莫名其妙的变更。

其次用户设置密码长度小于5会有提示密码过短，但如果密码长度为0，则不应该报错，因为用户可能只是误触，根本不打算有设置行为。其次是“密码太短，至少需要5个”的错误提示应该仅在第一次设置时出现，如果是第二次密码设置，密码长度小于5时应依然给出“两次输入的不一致”这样的错误提示，遵循交互设计一致性原则。

顺便修正了一个小bug，如果在设置完第一次密码后，提示“请再次输入手势密码”后没有继续设置第二次而是切换到了验证密码状态，此时如果上次设置的仍然保留，那么用户在重新切回设置状态时，设置一次就会提示“密码设置成功”或者“两次输入不一致”。这会让用户费解，甚至做出错误判断，体验变得非常差。这里进行了bug修复。也就是在切换到验证状态时，会将上次设置的密码清除。再次切回设置状态时，需要重新设置两次。

# 总结

最后很感谢能有这个机会接触一个实战性的项目，锻炼了自己独立思考解决问题的能力，且项目完成过程中，复习了一遍canvas的相关知识。最后由于制作较为仓促，可能依然存在一些bug和不完美的地方，所以不情之请是希望能得到一些宝贵的建议和意见，让我能在前端的道路上更进一步。
