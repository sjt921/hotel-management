const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, PageBreak, ShadingType,
  Bookmark, InternalHyperlink
} = require("docx");

const IMAGE_PATH = "C:\\Users\\27146\\Desktop\\毕设\\开题报告功能模块图1.png";

// ==================== CONTENT GENERATION ====================

async function main() {
  let imageRun = null;
  if (fs.existsSync(IMAGE_PATH)) {
    const imgBuf = fs.readFileSync(IMAGE_PATH);
    imageRun = new ImageRun({
      data: imgBuf,
      transformation: { width: 480, height: 330 },
      type: "png",
    });
  }

  const doc = new Document({
    sections: [
      // ==================== COVER PAGE ====================
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1417, right: 1134 }
          }
        },
        children: [
          empty(4),
          covTitle("毕业设计开题报告"),
          empty(2),
          covTopic("课    题：", "基于Spring Boot+Vue的酒店预订"),
          covTopic("", "管理系统的设计与实现"),
          empty(1),
          covInfo("学    院：", "　　　　　　　　　　　　"),
          covInfo("专    业：", "　　　　　　　　　　　　"),
          covInfo("学    号：", "　　　　　　　　　　　　"),
          covInfo("学生姓名：", "　　　　　　　　　　　　"),
          covInfo("指导教师：", "　　　（职称：　　　）"),
          empty(3),
          covDate("2026 年  10  月  10  日"),
        ],
      },

      // ==================== 文 献 综 述 ====================
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1417, right: 1134 }
          }
        },
        children: [
          mainTitle("文  献  综  述"),

          h1("1. 国内研究现状"),
          h2("1.1 国内外酒店管理系统研究进展"),

          // Each paragraph with superscript references
          b("在酒店管理信息化领域，国外起步较早，已形成较为成熟的产品体系。以Oracle Hospitality OPERA、Amadeus HotSOS等为代表的国际品牌酒店管理系统，功能涵盖中央预订（CRS）、收益管理（RMS）和客户关系管理（CRM）等多个维度，并广泛集成了在线分销渠道和移动端服务。然而，这些系统普遍价格昂贵、实施周期长，主要面向高星级连锁酒店，难以适应国内中小型酒店的预算和业务需求。"),

          b("国内方面，近年来酒店管理系统的研究与开发日趋活跃。董华军（2022）在《工业控制计算机》上发表论文，采用B/S架构设计了一套酒店管理系统，由客房预订、入住接待、宾客结账、报表管理与系统设置五大功能模块构成,验证了B/S架构在酒店管理场景下的可行性") + rs([1]) + b("。郭志英（2022）在《长江信息通信》上提出了基于Web的酒店管理系统，采用JSP技术和MVC架构，实现了房间预订、入住管理和自助结算等功能，在数据库设计方面给出了详细的实体联系图") + rs([2]) + b("。朱玉凤（2023）在《网络安全和信息化》上发表论文，采用SSM框架（Spring+Spring MVC+MyBatis）结合HTML和CSS技术进行酒店管理系统开发，对系统信息管理、数据库设计与用户需求分析进行了详细阐述") + rs([3]) + b("。汪康（2023）在《移动信息》上发表论文，采用B/S结构和Java语言，结合MySQL数据库设计了民宿酒店预订系统，实现了预订、退订、换房管理和客房类型管理等核心功能，系统运行良好、操作简便") + rs([4]) + b("。"),

          b("在国际研究方面，Singh等人（2023）在IJERT期刊发表综述文章，全面回顾了基于Web的酒店管理系统在预订自动化、客房管理、计费和客户关系管理等方面的研究进展，探讨了人工智能、数据分析和物联网等新兴技术在酒店管理系统中的集成应用前景，同时指出了数据安全、系统集成和可扩展性等关键挑战") + rs([5]) + b("。Marinova-Kostova（2023）考察了旅游预订系统从以航空公司为中心的起源到综合性平台的演进历程，探讨了云计算技术趋势和现代预订系统的基本功能特征") + rs([6]) + b("。孟莹（2023）在《电脑爱好者》上综述了酒店管理系统的设计与开发要点") + rs([7]) + b("。"),

          b("综合来看，酒店管理系统的技术路线已从早期的C/S架构逐步演进为B/S架构和前后端分离的开发模式，Spring Boot+Vue.js技术栈凭借高效开发、灵活扩展和良好性能的优势，正成为该领域的主流选择。"),

          h2("1.2 前后端分离开发模式研究"),

          b("前后端分离开发模式是近年来Web应用开发的主流架构。在技术著作方面，杨开振（2024）在《深入浅出Spring Boot 3.x》一书中，系统介绍了Spring Boot框架的核心技术，包括全注解下的Spring IoC和AOP、数据库编程（JPA、MyBatis、JDBC）、REST风格API设计以及Spring Cloud微服务开发等内容，为基于Spring Boot的后端开发提供了全面的技术指导") + rs([8]) + b("。刘博文（2019）在《深入浅出Vue.js》一书中，从源码层面深入剖析了Vue.js的变化侦测、虚拟DOM和模板编译等核心机制") + rs([9]) + b("。Craig Walls（2022）在《Spring in Action》（第六版）中，系统讲解了Spring Framework和Spring Boot的核心概念与最佳实践，是该领域公认的经典技术著作") + rs([10]) + b("。"),

          b("在应用开发层面，Aldisa（2024）采用快速应用开发（RAD）方法设计了基于Web的酒店预订信息系统，通过黑盒测试验证了系统的功能完整性，证明了敏捷开发方法在酒店管理系统开发中的有效性") + rs([11]) + b("。张若淼、吴明霞（2021）在《电脑编程技巧与维护》上发表论文，将情感分析与酒店客房预订系统结合，采用Vue.js和Spring Boot技术栈，探索了智能化功能在酒店预订系统中的集成方案") + rs([12]) + b("。"),

          b("上述研究表明，Spring Boot+Vue.js的前后端分离架构已在实际项目中得到广泛验证。前后端分离开发模式将用户界面与业务逻辑解耦，前端专注界面交互与用户体验，后端专注业务处理与数据管理，二者通过RESTful API进行标准化通信，有效提升了开发效率、代码可维护性和系统的可扩展性。"),

          h1("2. 总结"),

          b("通过文献综述可以看出，酒店管理系统的研究已从传统单体架构向B/S架构和前后端分离模式演进，Spring Boot+Vue.js技术栈因开发高效、灵活扩展和良好性能的优势，正成为该领域的主流技术方案。然而，现有研究多集中于单一功能模块或特定技术点的探讨，缺乏对中小型酒店全业务流程覆盖的完整系统设计方案。"),

          b("本课题拟针对这一研究空白，设计并实现一套覆盖客房管理、房型管理、预订管理、客户管理和消息通讯全流程的酒店管理预订系统，采用Spring Boot+Vue.js前后端分离架构，集成JWT认证和WebSocket实时通讯，为中小型酒店提供一套功能完整、操作便捷的数字化管理解决方案。"),

          // ==================== 开题报告 ====================
          new PageBreak(),
          mainTitle("开题报告"),

          h1("1. 选题依据"),
          h2("1.1 研究目的"),

          b("随着我国旅游业的蓬勃发展，酒店行业面临着日益增长的管理复杂性和服务质量要求。然而，当前大量中小型酒店仍采用传统的人工管理方式，存在信息更新滞后、预订管理混乱、客户资源利用率低等问题。本课题旨在设计并实现一套基于Spring Boot+Vue.js的酒店管理预订系统，具体研究目的包括："),
          b("（1）构建功能完善的酒店管理预订平台，覆盖客房管理、房型管理、预订管理、客户管理和消息通讯等核心业务场景，实现酒店日常运营的全面数字化。"),
          b("（2）采用前后端分离的B/S架构，后端基于Spring Boot提供RESTful API，前端基于Vue 3构建响应式单页面应用，确保系统的高可用性和良好的用户体验。"),
          b("（3）实现基于JWT的用户认证与权限管理机制，保障系统安全性；引入WebSocket技术实现实时消息通讯，提升客户服务效率。"),
          b("（4）通过本项目的实践，深入探索Spring Boot+Vue.js前后端分离开发模式在企业管理软件开发中的最佳实践。"),

          h2("1.2 研究意义"),
          b("（1）实践意义：为中小型酒店提供一套开箱即用的数字化管理工具，帮助其降低运营成本、提升管理效率和服务质量，加速酒店业务的信息化进程。系统填补了大型商业软件（昂贵、复杂）与人工管理（低效、易错）之间的市场空白。"),
          b("（2）技术意义：通过实际项目的设计与开发，验证Spring Boot+Vue.js前后端分离架构在酒店管理领域的适用性和技术优势，为该技术方案在其他企业管理软件开发中的推广积累实践经验。"),
          b("（3）社会意义：推动中小型酒店的信息化建设，有助于提升整个酒店行业的服务水平和管理水平，促进旅游服务业的数字化转型。"),

          h1("2. 主要研究内容和要求"),
          b("本课题主要研究内容包括以下六个方面："),
          b("（1）需求分析：深入调研中小型酒店的实际业务流程（客房管理、预订管理、客户管理等），归纳系统的功能需求（用户管理、房型管理、房间管理、客户管理、预订管理、消息通讯、数据统计）和非功能需求（性能、安全、可用性、可扩展性）。"),
          b("（2）系统架构设计：基于B/S模式和前后端分离开发范式，设计系统的总体技术架构。前端采用Vue 3+Vite+Element Plus+Pinia技术栈；后端采用Spring Boot+MyBatis-Plus+JWT+MySQL技术栈；前后端通过RESTful API和JSON格式进行数据交换。"),
          b("（3）数据库设计：根据业务需求进行概念结构设计（E-R图）、逻辑结构设计（关系模型）和物理结构设计，完成用户表、房型表、房间表、客户表、预订表和消息表等核心数据表的设计与创建。"),
          b("（4）后端开发：基于Spring Boot框架实现各功能模块的业务逻辑和RESTful API接口，采用分层架构（Controller-Service-Mapper）组织代码，集成JWT认证拦截器和WebSocket消息服务。"),
          b("（5）前端开发：基于Vue 3+Element Plus构建用户界面，使用Axios封装HTTP请求，使用Pinia管理全局状态，实现各功能模块的页面和交互逻辑。"),
          b("（6）系统测试：对系统进行功能测试、接口测试和性能测试，确保系统稳定可靠运行。"),
          b("本课题要求最终交付一套可运行的酒店管理预订系统、一篇完整的毕业设计论文以及相关的技术文档。"),

          h1("3. 研究思路及方案"),
          b("本系统采用B/S三层架构，将系统分为表现层（前端）、业务逻辑层（后端）和数据访问层（数据库），通过前后端分离的方式进行开发。系统总体功能模块如图1所示："),

          imageRun
            ? new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100 },
                children: [imageRun],
              })
            : null,
          imageRun ? imgCap("图1  系统功能模块图") : null,

          b("系统技术方案如下表所示："),
          techTable(),

          b("各功能模块设计如下：（1）用户管理模块：实现用户注册、登录、权限控制（管理员/员工），采用JWT Token进行身份认证；（2）房型管理模块：管理房型名称、价格、床型、面积等信息，作为房间的模板定义；（3）房间管理模块：管理具体房间的编号、楼层、状态（空闲/已入住/已预订/打扫中），支持按房型和状态筛选；（4）客户管理模块：记录客户姓名、身份证号、手机号等信息，支持快速检索；（5）预订管理模块：管理预订全流程（创建→确认→入住→退房→取消），自动计算总价，追踪状态变化；（6）消息通讯模块：基于WebSocket实现管理员与客户的实时双向通讯，支持会话管理和已读标记。"),

          h1("4. 研究方法、步骤及措施"),
          h2("4.1 研究方法"),
          b("（1）文献调研法：通过中国知网（CNKI）、万方数据、维普期刊、IEEE Xplore等学术数据库，广泛检索和阅读酒店管理系统、前后端分离架构、Spring Boot和Vue.js技术栈相关的学术论文和技术文献，为课题研究提供理论依据。"),
          b("（2）需求分析法：采用用例驱动的需求分析方法，调研中小型酒店的实际业务流程，绘制用例图和业务流程图，明确各功能模块的需求边界。"),
          b("（3）软件工程方法：遵循软件工程的标准开发流程，采用敏捷开发模式进行迭代式开发，将项目分解为需求分析、系统设计、编码实现、系统测试四个主要阶段。"),

          h2("4.2 研究步骤"),
          b("第一阶段——选题与开题（2026年10月）：查阅相关文献资料，确定研究方向和技术方案，完成开题报告和文献综述的撰写。"),
          b("第二阶段——需求分析与系统设计（2026年11月）：深入调研业务需求，完成需求分析文档、系统总体架构设计和数据库设计，输出E-R图和建表SQL脚本。"),
          b("第三阶段——系统开发（2026年12月—2027年3月）：按模块迭代开发，先完成后端RESTful API开发（用户管理→房型管理→房间管理→客户管理→预订管理→消息通讯），再完成前端页面开发。前后端联调，确保接口正确对接。"),
          b("第四阶段——系统测试（2027年4月—2027年5月）：进行功能测试（验证各功能模块按需求正确运行）、接口测试和性能测试，修复Bug并优化系统性能。"),
          b("第五阶段——论文撰写（2027年5月）：整理项目文档和开发资料，按照学校论文模板撰写毕业设计论文。"),
          b("第六阶段——答辩准备（2027年5月—2027年6月）：制作答辩PPT，准备系统演示，参加正式答辩。"),

          h2("4.3 研究措施"),
          b("（1）技术学习与储备：系统学习Spring Boot 3.x、Vue 3、MyBatis-Plus、JWT、WebSocket等核心技术的官方文档和实战教程，建立扎实的技术基础。"),
          b("（2）版本管理与代码规范：使用Git进行版本控制，遵循阿里巴巴Java开发手册和Vue.js风格指南编写规范代码，确保代码质量和可维护性。"),
          b("（3）定期汇报与反馈：定期向指导教师汇报研究进展，及时获取反馈意见并调整研究方向，确保课题按计划推进。"),
          b("（4）文档同步撰写：在开发过程中同步编写需求文档、设计文档和使用手册，避免事后补写导致信息遗漏。"),

          // ==================== 参考文献 ====================
          new PageBreak(),
          mainTitle("参  考  文  献"),

          refLine("1", "[1] 董华军. 酒店管理系统的设计与实现[J]. 工业控制计算机, 2022, 35(1): 140-141."),
          refLine("2", "[2] 郭志英. 基于Web的酒店管理系统的设计与实现[J]. 长江信息通信, 2022, 35(12): 120-123."),
          refLine("3", "[3] 朱玉凤. 基于JavaWeb的酒店管理系统的设计与实现[J]. 网络安全和信息化, 2023(12): 91-94."),
          refLine("4", "[4] 汪康. 民宿酒店预订系统的设计与实现[J]. 移动信息, 2023(7): 217-220."),
          refLine("5", "[5] Singh J, Mavi A S, Kaur K. Comprehensive Review on Web-based Hotel Management System[J]. International Journal of Engineering Research & Technology (IJERT), 2023, 12(11)."),
          refLine("6", "[6] Marinova-Kostova K. Key Dimensions of Web-Based Reservation Systems in Modern Tourism Sector[J]. Polish Journal of Science, 2023(69): 18-20."),
          refLine("7", "[7] 孟莹. 浅谈酒店管理系统的设计与开发[J]. 电脑爱好者(电子刊), 2023(5): 1143-1144."),
          refLine("8", "[8] 杨开振. 深入浅出Spring Boot 3.x[M]. 北京: 人民邮电出版社, 2024."),
          refLine("9", "[9] 刘博文. 深入浅出Vue.js[M]. 北京: 人民邮电出版社, 2019."),
          refLine("10", "[10] Craig Walls. Spring in Action, Sixth Edition[M]. Manning Publications, 2022."),
          refLine("11", "[11] Aldisa R T. Hotel Reservation System Using Website Based Rapid Application Development (RAD) Method[J]. International Journal of Society Reviews (INJOSER), 2024, 2(3): 851-855."),
          refLine("12", "[12] 张若淼, 吴明霞. 基于评论情感分析需求的酒店客房预定系统[J]. 电脑编程技巧与维护, 2021(12): 101-105."),

          // ==================== 意见 ====================
          new PageBreak(),
          mainTitle("指导教师意见"),
          empty(4),
          b("指导教师（签名）：__________________"),
          empty(1),
          b("年    月    日"),
          empty(6),
          mainTitle("学院审查意见"),
          empty(4),
          b("学院（盖章）：__________________"),
          empty(1),
          b("年    月    日"),
        ].filter(Boolean),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "C:\\Users\\27146\\Desktop\\毕设\\开题报告.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("DONE: " + outPath);
  console.log("Now converting to .doc...");
}

// ==================== BUILDERS ====================

function empty(n) { const a = []; for (let i = 0; i < n; i++) a.push(new Paragraph({ children: [] })); return a; }

function covTitle(t) { return new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 200, after: 300, line: 276 },
  children: [new TextRun({ text: t, size: 36, font: { ascii: "宋体", eastAsia: "宋体" } })]
});}

function covTopic(label, t) { const r = []; if (label) r.push(new TextRun({ text: label, size: 32, font: "宋体" })); r.push(new TextRun({ text: t, size: 32, font: "宋体" })); return new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { line: 720, lineRule: "exact" }, indent: { firstLine: 1216 }, children: r
});}

function covInfo(label, v) { return new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { line: 720, lineRule: "exact" }, indent: { firstLine: 1216 },
  children: [new TextRun({ text: label, size: 32, font: "宋体" }), new TextRun({ text: v, size: 32, font: "宋体", underline: true })]
});}

function covDate(t) { return new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 200 },
  children: [new TextRun({ text: t, size: 36, font: "宋体" })]
});}

function mainTitle(t) { return new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 120, after: 240, line: 360 },
  children: [new TextRun({ text: t, size: 30, bold: true, font: { ascii: "黑体", eastAsia: "黑体" } })]
});}

function h1(t) { return new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { before: 160, after: 0, line: 360 },
  children: [new TextRun({ text: t, size: 28, bold: true, font: { ascii: "黑体", eastAsia: "黑体" } })]
});}

function h2(t) { return new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { before: 100, after: 0, line: 360 },
  children: [new TextRun({ text: t, size: 24, bold: true, font: { ascii: "黑体", eastAsia: "黑体" } })]
});}

// Body paragraph: 宋体小四(12pt/24halfpt), 1.5倍行距(360twips), justify, indent 24pt(480twips)
function bp(text) { return new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 0, line: 360 }, indent: { firstLine: 480 },
  children: [new TextRun({ text, size: 24, font: { ascii: "宋体", eastAsia: "宋体" } })]
});}

// Generate a body paragraph from parts array (strings and ref arrays mixed)
function b(text) { return text; }

function rs(nums) { return "[" + nums.join(",") + "]"; }

// Turn body + refs into a paragraph
function refLine(id, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 320, lineRule: "exact" },
    children: [
      new Bookmark({
        id: "ref" + id,
        children: [
          new TextRun({ text, size: 21, font: { ascii: "宋体", eastAsia: "宋体" } }),
        ],
      }),
    ],
  });
}

function imgCap(t) { return new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text: t, size: 20, font: "宋体" })]
});}

function techTable() {
  const h = ["层次","技术选型","说明"];
  const rows = [
    ["前端框架","Vue 3 + Vite","组合式API，新一代构建工具"],
    ["UI组件库","Element Plus","Vue 3桌面端组件库"],
    ["状态管理","Pinia","Vue 3官方状态管理"],
    ["路由","Vue Router 4","SPA前端路由"],
    ["HTTP客户端","Axios","请求/响应拦截，统一错误处理"],
    ["实时通讯","WebSocket+STOMP","双向消息通讯"],
    ["后端框架","Spring Boot 3.2","企业级Java框架，内嵌Tomcat"],
    ["持久层","MyBatis-Plus 3.5","通用CRUD，分页插件"],
    ["数据库","MySQL 8.0","关系型数据库"],
    ["认证","JWT","无状态Token认证"],
  ];
  const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const cb = { top: border, bottom: border, left: border, right: border };
  const hc = h.map(t => new TableCell({
    borders: cb, width: { size: 100/h.length, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: "D9E2F3" },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, size: 20, bold: true, font: "宋体" })] })],
  }));
  const dr = rows.map((r,i) => new TableRow({ children: r.map(c => new TableCell({
    borders: cb, width: { size: 100/h.length, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: i%2===0?"FFFFFF":"F2F2F2" },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c, size: 20, font: "宋体" })] })],
  }))}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: hc }), ...dr] });
}

// Generate a paragraph from concatenated body parts
// Since we can't easily mix TextRun and InternalHyperlink in string concatenation,
// we generate paragraphs with superscript reference markers
function makeBodyParagraph(parts) {
  const runs = [];
  for (const p of parts) {
    if (typeof p === "string") {
      runs.push(new TextRun({ text: p, size: 24, font: { ascii: "宋体", eastAsia: "宋体" } }));
    } else if (typeof p === "object" && p.type === "ref") {
      // Add superscript reference like [1,2,3]
      const nums = p.nums;
      runs.push(new TextRun({ text: "[" + nums.join(",") + "]", size: 24, font: { ascii: "宋体", eastAsia: "宋体" }, superScript: true }));
    }
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 360 },
    indent: { firstLine: 480 },
    children: runs,
  });
}

main().catch(err => { console.error(err); process.exit(1); });
