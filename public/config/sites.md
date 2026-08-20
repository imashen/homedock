# 服务导航（Markdown 镜像）— 占位示例数据

> 应用默认读取 `sites.yaml`。若改用本格式，删掉 yaml / json 即可。
> 链接卡：`- [名称](url) 描述 @scope :icon: status:online`
> 端口卡：`- 名称 描述 @scope :icon: host: 1.2.3.4 ports: 22 / SSH status:online`
> scope 可选 internal / external / both；icon 用 :emoji: 包裹；status 可选 online / closed / unknown。
> ⚠️ 本文件为公开演示用的占位数据，不含任何真实主机地址、域名或凭证。

## 网关与路由
- [主路由示例](http://10.0.0.1) 全屋网络的总闸口——拨号、DHCP 与所有设备的进出流量都在此调度。 @internal :🛰️:
- [无线 AP 示例](http://10.0.0.2) 与主路由协同的无线中枢，mesh 回程与信号覆盖一目了然。 @internal :📡:

## 虚拟化与存储
- [虚拟化平台](https://10.0.0.3:8006) 宿主机管理台，虚拟机与容器在此编排、快照与迁移。 @internal :🖥️:
- [存储服务器](http://10.0.0.5) 数据的中央仓库，SMB/NFS 共享、快照与冗余阵列尽在掌握。 @internal :🗄️:
- [运维面板](http://10.0.0.6:3000) 可视化的网站与运行环境管家，建站、备份与防火墙一键搞定。 @internal :🌐:
- [文件同步](http://10.0.0.8:8384) 去中心化的文件同步，多设备间静默互备、永不落地第三方。 @internal :🔁:

## 网络与安全
- [DNS 过滤](http://10.0.0.4) 全屋 DNS 中枢，拦截广告与追踪，还能按设备定制上网策略。 @internal :🛡️:
- [动态域名](http://10.0.0.8:9876) 把变动的公网 IP 实时绑定到域名，外网回家不再死记地址。 @internal :🌐:
- [容器管理](https://10.0.0.8:9443) Docker 的可视化驾驶舱，镜像、容器与网络栈尽收眼底。 @internal :🐳:

## 远程与端口
- 宿主终端 直连宿主机命令行，底层运维与排障的快通道。 @internal :🔑: host: 10.0.0.3 ports: 22 / SSH
- Web 服务器终端 登录 Web 服务器终端，部署脚本与日志排查的入口。 @internal :🔑: host: 10.0.0.6 ports: 22 / SSH
- Docker 宿主机 登入 Docker 宿主机，手动编排容器、排查网络的第一现场。 @internal :🔑: host: 10.0.0.8 ports: 22 / SSH
- 虚拟桌面 图形化远程桌面，跑专属软件与轻量桌面的窗口。 @internal :🪟: host: 10.0.0.16 ports: 3389 / RDP

## 个人站点
- [博客示例](https://example.com) 记录思考与折腾的技术随笔，一处长期主义的数字花园。 @external :✍️:
- [随笔示例](https://blog.example.com) 生活与碎碎念的另一处自留地，随手写、慢慢更。 @external :📝: status:unknown

## 媒体与工具
- [照片库](https://photos.example.com:4443) 自托管的照片之家，原图备份、人脸相册与回忆时间线。 @external :📷:
- [音乐流媒体](https://music.example.com:4443) 私有的音乐流媒体，把收藏变成随时随地的私人电台。 @external :🎵:
- [密码保险箱](https://vault.example.com:4443) 自托管的密码保险箱，全平台同步，密钥只握在自己手里。 @external :🔐:
- [影音中枢](https://media.example.com:4443) 家庭影音中枢，电影、剧集与直播随时推流到任意屏幕。 @external :🎬:
- [服务器探针](https://status.example.com:4443) 实时盯梢各主机的 CPU、内存与网络，异常一眼可见。 @external :📊:
- [学习助手](https://learn.example.com:4443) AI 陪练式学习助手，当前临时停机维护中。 @external :🎓: status:closed
