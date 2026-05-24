# Stage 2 作业要求与打分制度总结

本文件用于总结 `NeighbourLink` 的 **Stage 2 原始作业要求**、**评分结构**、**提交组成**、**常见误区** 和 **高分关注点**。  
目的不是代替老师最新通知，而是把 Stage 2 的正式要求整理成一份后续可持续参考的说明。

---

## 1. Stage 2 的核心定位

Stage 2 不是让你把 Stage 1 推翻重做，而是要求你：

1. 以 Stage 1 为基础
2. 面对新的 context / requirement change
3. 分析原设计如何响应变化
4. 展示设计推理、取舍、适应性与一致性

换句话说，Stage 2 的重点不是“做更多功能”，而是：

- **在变化约束下做出合理设计**
- **解释为什么这样改**
- **确保 report、UML、prototype 三者一致**

---

## 2. Stage 2 需要提交什么

Stage 2 主要包含以下提交物：

1. `Final Written Report`
2. `Interface Prototype`
3. `Video Pitch`
4. `GenAI Reflection and Critique`
5. `GenAI Declaration Form`

此外还有一个很容易漏掉但很重要的内容：

6. `Peer Assessment Form`

说明：

- `GenAI Reflection` 是写进 final report 里的，不是独立报告
- `GenAI Declaration Form` 一般是单独提交或附表
- `Peer Assessment Form` 会影响个人分数，即使它不计入 20 分主评分表，也不能忽略

---

## 3. 总分结构（20 分）

Stage 2 总体可以理解为 **20 分制**：

| 部分 | 权重 | 对应分值 |
|---|---:|---:|
| Final Written Report | 12% | 12 分 |
| Interface Prototype | 4% | 4 分 |
| Video Pitch | 2% | 2 分 |
| GenAI Reflection and Critique | 2% | 2 分 |
| **合计** | **20%** | **20 分** |

`GenAI Declaration Form` 和 `Peer Assessment Form` 一般不是按这 20 分直接打分，但它们仍然属于**必须满足的提交要求**。

---

## 4. Final Written Report 要求

### 4.1 正式要求

根据 Stage 2 原始说明，final report 需要：

- 针对 Stage 2 的 changed context 进行分析
- 展示 problem understanding
- 展示 requirement quality and justification
- 展示 modelling correctness
- 展示 design reasoning and trade-offs
- 展示 report 的 coherence and consistency

### 4.2 页数要求

原始官方说明通常写的是：

- `10 pages maximum`
- `page limits are maximums, not targets`
- `cover page, references, appendices` 不计入正文页数
- `appendices optional`
- `appendices not required for marks`

这意味着：

- 正文的关键分析内容必须在页数上限内完成
- 不能把真正拿分的核心内容全部扔到 appendix

### 4.3 关于“9 页”与“10 页”的处理

如果后来老师在课堂或公告里明确把正文页数改成 `9 pages`，那么实际提交时：

- **优先遵守最新老师通知**

但如果你在整理正式要求时需要写“原始 brief 怎么规定”，那就可以说明：

- 原始 brief 为 `10 pages maximum`
- 若课程后来另行通知 `9 pages`，则以最新通知为准

这类说明在你自己的工作笔记里可以保留，但最终提交报告正文中一般不需要展开讨论。

---

## 5. Final Written Report 评分标准（12 分）

| 评分维度 | 分值 |
|---|---:|
| Problem understanding and scope | 2 |
| Requirements quality and justification | 3 |
| Modelling and design correctness | 3 |
| Design justification, trade-offs, and response to context change | 2 |
| Coherence and consistency | 2 |
| **合计** | **12** |

### 5.1 这些维度分别在看什么

#### 1. Problem understanding and scope（2 分）

看你是否：

- 真正理解 NeighbourLink 的问题本质
- 说明系统解决的是什么问题，而不是堆功能
- 定义清晰 scope
- 说明 Stage 2 changed context 对 scope 的影响

#### 2. Requirements quality and justification（3 分）

这是 report 最重的部分之一。重点看：

- requirement 是否清楚
- requirement 是否合理、可解释
- requirement 是否和用户需求、业务规则、Stage 2 context change 对齐
- requirement 是否避免太空泛

高分通常意味着：

- requirements 经过 prioritisation
- 能说清楚为什么保留、为什么简化、为什么延后

#### 3. Modelling and design correctness（3 分）

重点看：

- UML 是否正确
- UML 是否和需求一致
- 类图、活动图、用例图等是否表达了真实逻辑
- multiplicity、关系、状态转移、主流程与分支是否合理

高分不是“图多”，而是：

- 图能讲清楚系统逻辑
- 图之间一致
- 图和报告一致

#### 4. Design justification, trade-offs, and response to context change（2 分）

重点看：

- 你有没有解释为什么这么改
- 有没有做取舍分析
- 有没有体现 Stage 2 的“适应变化”

老师看重的是：

- 你不是机械删功能
- 而是在 changed context 下做了合理的设计决策

#### 5. Coherence and consistency（2 分）

重点看：

- 术语是否一致
- report / UML / prototype 是否讲的是同一个系统
- 有没有前后矛盾
- 有没有一处说保留，一处又删掉

这个维度虽然只有 2 分，但很容易因为“不一致”被整体拉低印象分。

---

## 6. Interface Prototype 要求（4 分）

### 6.1 正式要求

Prototype 的官方重点通常很明确：

- `design focused`
- `not implementation focused`
- `no backend`
- `no data storage`
- `no scripting`
- `HTML and CSS only`
- `focus on navigation and layout only`
- `a small number of representative pages is sufficient`
- `visual polish and advanced CSS do not earn extra marks`

也就是说，老师看重的是：

- 页面结构
- 页面之间跳转逻辑
- 要求覆盖

不是看你做得像不像一个正式上线系统。

### 6.2 Prototype 评分标准（4 分）

| 评分维度 | 分值 |
|---|---:|
| Structural clarity of pages | 1.5 |
| Navigation logic and consistency | 1.5 |
| Alignment with requirements | 1 |
| **合计** | **4** |

### 6.3 这部分真正拿分的点

#### Structural clarity of pages

看：

- 页面是不是清楚
- 每页目的是否明确
- 有没有过多混乱内容
- 页面数量和结构是否合理

#### Navigation logic and consistency

看：

- 流程是不是清晰
- 用户能不能从一个页面顺利走到下一步
- 命名、导航、状态表达是否一致

#### Alignment with requirements

看：

- prototype 页面是否真的映射需求
- 不是做漂亮 UI，而是要展示设计逻辑

### 6.4 常见误区

- 误以为做得越像真实产品越高分
- 误以为加 JS / backend / dynamic logic 会加分
- 误以为地图、动画、复杂交互会带来额外收益

实际上：

- 如果这些内容破坏了 “HTML/CSS only, design focused” 的要求，反而可能带来解释压力

---

## 7. Video Pitch 要求（2 分）

### 7.1 正式要求

视频通常要求：

- 最多 `5 minutes`
- 面向 `non-technical audience`
- 内容应复用 report 和 prototype
- 不要求高质量剪辑或制作

### 7.2 评分标准（2 分）

| 评分维度 | 分值 |
|---|---:|
| Clarity of explanation | 1 |
| Alignment with report and design | 1 |
| **合计** | **2** |

### 7.3 高分关键

不要把视频讲成：

- 技术实现炫技
- API 演示
- 代码 walkthrough

更好的方向是：

- 讲清楚系统解决什么问题
- 讲清楚用户怎么使用
- 讲清楚 Stage 2 为什么这样改
- 保持和 report / prototype 同口径

---

## 8. GenAI Reflection and Critique 要求（2 分）

### 8.1 正式要求

GenAI Reflection 一般要求：

- `400 to 600 words`
- `one group reflection`
- `included in the final report`

通常需要包括：

1. 一个 GenAI 如何帮助分析或设计的具体例子
2. 一个错误建议 / 误导输出 / 局限
3. 团队如何验证、修正、跟进
4. 人类判断如何影响最终设计决策

### 8.2 评分标准（2 分）

| 评分维度 | 分值 |
|---|---:|
| Critical evaluation of GenAI output and identification of limitations | 1 |
| Evidence of human judgement in refining or correcting GenAI suggestions | 1 |
| **合计** | **2** |

### 8.3 高分关键

老师想看到的不是：

- “AI 很有帮助”
- “AI 帮我写了很多”

而是：

- 你如何把 AI 当作候选意见来源
- 你如何发现它错了或过度设计了
- 你如何用 human judgement 收口

---

## 9. GenAI Declaration Form 和 Peer Assessment Form

### 9.1 GenAI Declaration Form

一般是：

- 单独提交
- 说明是否使用 GenAI、使用方式、范围等

它通常不直接计入 20 分主评分表，但属于要求的一部分。

### 9.2 Peer Assessment Form

一般是：

- 每位学生单独提交
- 会影响个人成绩调整

即使它不直接属于 20 分 rubric，也不能忽略。

---

## 10. Stage 2 最容易被误解的地方

### 10.1 Stage 2 不是拼功能数量

高分不来自：

- 做最多页面
- 做最多交互
- 做最复杂实现

高分来自：

- 在 changed context 下做最合理的收口

### 10.2 Prototype 不是 runnable app 比赛

如果作业明确说：

- HTML/CSS only
- no scripting
- no backend

那你真正要证明的是：

- 结构
- 导航
- 范围控制

### 10.3 Appendix 不会替代正文拿分

appendix 可选，不是主要得分区。  
不要把关键 reasoning、关键 requirement justification、关键模型解释都塞到 appendix。

### 10.4 Stage 2 最重要的是一致性

如果 report 讲的是一个系统，prototype 展示另一个系统，UML 又是第三个系统，那么即使每个单体看起来还不错，也会被 coherence 拉低。

---

## 11. 高分作业通常具备什么特征

高分 Stage 2 提交通常会体现出下面这些特点：

1. **问题理解清楚**
   - 先讲清楚系统解决什么问题，而不是直接讲页面和功能

2. **context change 响应合理**
   - 明确说明变化是什么
   - 解释为什么要简化、保留、延后

3. **requirements 有优先级和理由**
   - 不是罗列 feature list
   - 而是说明 essential / simplified / deferred

4. **UML 真实、克制、逻辑一致**
   - 不乱加类
   - 不乱扩 scope
   - 图和系统逻辑一致

5. **prototype 小而清楚**
   - 页面数适中
   - 主要流程清楚
   - 页面用途明确

6. **术语统一**
   - requirement、UML、prototype、video 里都用同一套词

7. **GenAI reflection 有批判性**
   - 有具体例子
   - 有错误示例
   - 有 human judgement

---

## 12. 当前最推荐的执行策略

如果目标是尽量拿高分，最稳的顺序通常是：

1. 先统一最终系统范围
2. 再统一 UML
3. 再统一 prototype
4. 最后统一 report 文字

因为 Stage 2 的高分关键不是“单个 artefact 很强”，而是：

- **所有 artefact 讲的是同一个设计**

---

## 13. 最终检查清单

提交前建议确认：

- [ ] report 页数符合最新老师要求
- [ ] report 正文不再讲旧版本或已删除功能
- [ ] prototype 为 HTML/CSS only
- [ ] prototype 页面数量为 representative 而非过度展开
- [ ] UML 和 prototype 一致
- [ ] report 和 UML 一致
- [ ] report 和 prototype 一致
- [ ] GenAI reflection 在 400-600 words 内
- [ ] video pitch 不超过 5 分钟
- [ ] declaration form 已完成
- [ ] peer assessment form 已完成

---

## 14. 一句话总结

Stage 2 的本质不是“把系统做大”，而是：

> **在 changed context 下，用最小但完整、合理且一致的设计，证明你理解需求、能做取舍、能把设计讲清楚。**

