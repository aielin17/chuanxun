        const APP_PREFIX = 'CHAT_APP_V3_';
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
        const MESSAGES_PER_PAGE = 50;
        
        function safeGetItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error getting item:', e);
                return null;
            }
        }

        function safeSetItem(key, value) {
            try {
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Error setting item:', e);
            }
        }

        function safeRemoveItem(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error removing item:', e);
            }
        }

        function cropImageToSquare(file, maxSize = 640) { 
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const minSide = Math.min(img.width, img.height);
                        const sx = (img.width - minSide) / 2;
                        const sy = (img.height - minSide) / 2;

                        const canvas = document.createElement('canvas');
                        canvas.width = maxSize;
                        canvas.height = maxSize;
                        const ctx = canvas.getContext('2d');

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);

                        resolve(canvas.toDataURL('image/jpeg', 0.95));
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const CONSTANTS = {
            HEADER_MOTTOS: [
                "⋆⁺₊⋆ ☾ ⋆⁺₊⋆ 思念的电波已连接 ⋆⁺₊⋆ ☾ ⋆⁺₊⋆",
                "我们是彼此的宇宙回响",
                "所有思绪，都奔向你",
                "答案很长，我准备用一生来回答",
                "月色真美",
                "一期一会",
                "念念不忘，必有回响",
                "山有木兮木有枝",
                "今晚月色真美",
                "春风十里不如你",
                "心有猛虎，细嗅蔷薇",
                "人间有味是清欢",
                "斯人若彩虹，遇上方知有",
                "You are my sunshine",
                "I love you three thousand",
                "What is essential is invisible to the eye",
                "Carpe diem",
                "To be or not to be",
                "永遠の一瞬",
                "君の名は",
                "世界が終わるまでは",
                "さようなら、ありがとう",
                "君と会えてよかった",
                "人生若只如初见",
                "当时只道是寻常",
                "曾经沧海难为水",
                "此情可待成追忆",
                "似此星辰非昨夜",
                "The best is yet to come",
                "All you need is love",
                "Let it be",
                "Here comes the sun",
                "Yesterday once more",
                "春はあけぼの",
                "物の哀れ",
                "わびさび",
                "花は桜木人は武士",
                "一期一会",
                "山有木兮木有枝",
                "心悦君兮君不知",
                "风起于青萍之末",
                "云卷云舒",
                "花开花落",
                "月圆月缺",
                "潮起潮落",
                "心有灵犀一点通",
                "言有尽而意无穷",
                "风乍起，吹皱一池春水",
                "云无心以出岫",
                "花自飘零水自流",
                "月是故乡明",
                "潮平两岸阔",
                "心有千千结",
                "言不尽意",
                "此时此夜难为情",
                "欲语泪先流",
                "千山万水",
                "风萧萧兮易水寒",
                "云淡风轻",
                "花好月圆",
                "月落乌啼霜满天",
                "潮落夜江斜月里",
                "心之所向，素履以往",
                "言为心声",
                "此情可待成追忆",
                "欲穷千里目",
                "千里共婵娟"
            ],
            WELCOME_ANIMATIONS: [{
                line1: "♡ 爱 ♡",
                line2: "✧ 正在连接我们的思绪 ✧"
            },
                {
                    line1: "𝑳𝒐𝒗𝒆",
                    line2: "若要由我来谈论爱的话"
                },
                {
                    line1: "𝕰𝖈𝖍𝖔",
                    line2: "听见我的回音了吗？"
                },
                {
                    line1: "𝚂𝚘𝚞𝚕𝚖𝚊𝚝𝚎",
                    line2: "灵魂正在共振"
                },
                {
                    line1: "Akashic Eye",
                    line2: "链接已建立"
                },
                {
                    line1: "✦ 相遇 ✦",
                    line2: "在万千人海中遇见你"
                },
                {
                    line1: "詩篇",
                    line2: "为你写下的每一行诗"
                },
                {
                    line1: "Melody",
                    line2: "心跳的旋律为你奏响"
                },
                {
                    line1: "Destiny",
                    line2: "命运的红线将我们相连"
                },
                {
                    line1: "Memory",
                    line2: "创造属于我们的回忆"
                },
                {
                    line1: "言葉",
                    line2: "想传达给你的话语"
                },
                {
                    line1: "絆",
                    line2: "看不见的羁绊"
                },
                {
                    line1: "未来",
                    line2: "一起走向的未来"
                },
                {
                    line1: "希望",
                    line2: "你就是我的希望"
                },
                {
                    line1: "光",
                    line2: "你是我生命中的光"
                },
                {
                    line1: "Amore",
                    line2: "心跳漏拍的那一秒"
                },
                {
                    line1: "共振",
                    line2: "频率相同的两个灵魂"
                },
                {
                    line1: "∞",
                    line2: "无限循环的思念"
                },
                {
                    line1: "Serendipity",
                    line2: "最美丽的意外"
                },
                {
                    line1: "浮世",
                    line2: "沉浮人世间的温柔"
                },
                {
                    line1: "量子纠缠",
                    line2: "超越距离的默契"
                },
                {
                    line1: "Elysian",
                    line2: "与你共度的理想乡"
                },
                {
                    line1: "星轨",
                    line2: "交汇时互放的光亮"
                },
                {
                    line1: "虹色",
                    line2: "折射出所有的可能"
                },
                {
                    line1: "Paracosm",
                    line2: "共同构建的私宇宙"
                },
                {
                    line1: "潮汐",
                    line2: "因你而起的律动"
                },
                {
                    line1: "Æther",
                    line2: "弥漫在空气中的悸动"
                },
                {
                    line1: "双星",
                    line2: "彼此环绕的永恒舞蹈"
                },
                {
                    line1: "绯色",
                    line2: "染上脸颊的温度"
                },
                {
                    line1: "Symphony",
                    line2: "生命交织的乐章"
                },
                {
                    line1: "经纬",
                    line2: "注定相遇的坐标"
                },
                {
                    line1: "Nebula",
                    line2: "朦胧而璀璨的心事"
                },
                {
                    line1: "时雨",
                    line2: "恰到好处的温柔"
                },
                {
                    line1: "Event Horizon",
                    line2: "再也无法逃离的引力"
                },
                {
                    line1: "花火",
                    line2: "刹那即永恒的光芒"
                },
                {
                    line1: "ℰ𝓉𝑒𝓇𝓃𝒶𝓁",
                    line2: "时间停驻的此刻"
                },
                {
                    line1: "韶光",
                    line2: "与你共度的每寸光阴"
                },
                {
                    line1: "𝒮𝓊𝓂𝓂𝑒𝓇",
                    line2: "永不结束的盛夏"
                },
                {
                    line1: "星霜",
                    line2: "共同经历的岁月"
                },
                {
                    line1: "𝓚𝓲𝓼𝓼",
                    line2: "未说出口的告白"
                },
                {
                    line1: "月下",
                    line2: "两人独处的夜晚"
                },
                {
                    line1: "𝓕𝓸𝓻𝓮𝓿varepsilon𝓻",
                    line2: "想要延续的永远"
                },
                {
                    line1: "朝露",
                    line2: "晶莹剔透的真心"
                },
                {
                    line1: "𝓜𝓲𝓻𝓪𝓬𝓵𝓮",
                    line2: "你就是奇迹本身"
                },
                {
                    line1: "春风",
                    line2: "轻轻拂过的温柔"
                },
                {
                    line1: "𝓛𝓾𝓬𝓴𝔂",
                    line2: "此生最大的幸运"
                },
                {
                    line1: "萤火",
                    line2: "黑暗中指引的光"
                },
                {
                    line1: "𝓗𝓮𝓪𝓻𝓽",
                    line2: "为你跳动的心脏"
                },
                {
                    line1: "初雪",
                    line2: "纯洁无瑕的爱意"
                },
                {
                    line1: "𝓒𝓸𝓶𝓮𝓽",
                    line2: "划过天际的相遇"
                },
                {
                    line1: "潮鸣",
                    line2: "内心澎湃的声音"
                },
                {
                    line1: "𝓢𝓽𝓪𝓻𝓭𝓾𝓼𝓽",
                    line2: "散落在身的星尘"
                },
                {
                    line1: "梧桐",
                    line2: "等待凤凰的执着"
                },
                {
                    line1: "𝓟𝓻𝓮𝓬𝓲𝓸𝓾𝓼",
                    line2: "视若珍宝的你我"
                },
                {
                    line1: "青空",
                    line2: "澄澈如你的眼眸"
                },
                {
                    line1: "𝒜𝓂𝒶𝓇𝓃𝓉𝒽",
                    line2: "永不凋零的心意"
                },
                {
                    line1: "Étoile",
                    line2: "你是我唯一的星辰"
                },
                {
                    line1: "𝑩𝒍ü𝒕𝒆",
                    line2: "悄然绽放的恋慕"
                },
                {
                    line1: "運命",
                    line2: "避无可避的相遇"
                },
                {
                    line1: "𝑪𝒆𝒍𝒆𝒔𝒕𝒆",
                    line2: "来自天际的馈赠"
                },
                {
                    line1: "恋心",
                    line2: "藏不住的悸动"
                },
                {
                    line1: "𝑺𝒆𝒓𝒂𝒑𝒉",
                    line2: "守护你的六翼天使"
                },
                {
                    line1: "一期一会",
                    line2: "一生一次的邂逅"
                },
                {
                    line1: "𝑬𝒑𝒐𝒏𝒂",
                    line2: "穿越时空的眷恋"
                },
                {
                    line1: "月の雫",
                    line2: "月光凝成的泪滴"
                },
                {
                    line1: "𝑽𝒆𝒓𝒔𝒂𝒊𝒍𝒍𝒆𝒔",
                    line2: "为你建造的宫殿"
                },
                {
                    line1: "千夜一夜",
                    line2: "诉不尽的夜话"
                },
                {
                    line1: "𝑴𝒂𝒓é𝒆",
                    line2: "温柔席卷的浪潮"
                },
                {
                    line1: "桃源郷",
                    line2: "只属于两人的乐土"
                },
                {
                    line1: "𝑺𝒐𝒖𝒇𝒇𝒍𝒆𝒓",
                    line2: "甜蜜的折磨"
                },
                {
                    line1: "桜吹雪",
                    line2: "纷飞如雪的思念"
                },
                {
                    line1: "𝑨𝒖𝒓𝒐𝒓𝒆",
                    line2: "黎明前的极光"
                },
                {
                    line1: "十六夜",
                    line2: "最圆满的夜晚"
                },
                {
                    line1: "𝑪𝒚𝒂𝒏𝒐𝒑𝒉𝒚𝒍𝒍𝒆",
                    line2: "青涩的恋之叶"
                },
                {
                    line1: "金木犀",
                    line2: "秋日里暗香浮动"
                },
            ],
            WELCOME_ICONS: [
                "fas fa-heart", "fas fa-star", "fas fa-moon", "fas fa-sun", "fas fa-cloud", "fas fa-feather", "fas fa-book", "fas fa-music", "fas fa-pen", "fas fa-key", "fas fa-compass", "fas fa-globe", "fas fa-leaf", "fas fa-water", "fas fa-fire", "fas fa-snowflake", "fas fa-umbrella", "fas fa-anchor", "fas fa-bell", "fas fa-gem", "fas fa-crown", "fas fa-dragon", "fas fa-feather-alt", "fas fa-fish", "fas fa-frog", "fas fa-hat-wizard", "fas fa-magic", "fas fa-ring", "fas fa-scroll", "fas fa-shield-alt", "fas fa-dove", "fas fa-cat", "fas fa-dog", "fas fa-horse", "fas fa-otter", "fas fa-paw", "fas fa-spider", "fas fa-kiwi-bird", "fas fa-crow", "fas fa-dove", "fas fa-seedling", "fas fa-tree", "fas fa-mountain", "fas fa-water", "fas fa-wind", "fas fa-volcano", "fas fa-meteor", "fas fa-satellite", "fas fa-rocket", "fas fa-user-astronaut"
            ],
            PARTNER_STATUSES: ["在线", "忙碌", "离开", "思考", "听音乐", "阅读", "工作", "学习", "想你", "休息", "睡觉", "晒太阳", "晴天", "多云", "阴天", "小雨", "中雨", "大雨", "雷阵雨", "暴雨", "小雪", "中雪", "大雪", "暴雪", "雾天", "大雾", "清晨", "晌午", "休息", "夜晚", "深夜", "探索", "沉思", "等待", "玩游戏", "发呆", "吃饭", "下午茶", "甜点", "撸猫", "撸狗", "牵挂", "健身", "惊醒", "惊讶", "空虚", "坚定", "迷茫", "忐忑", "惆怅", "思念", "安心", "不舍", "冷静", "难言", "失眠", "疲倦", "空白", "补充", "迟疑", "依恋", "洗漱", "压抑", "交友", "帮助", "梦境", "祝福", "回家", "生气", "撒娇", "吃醋", "快乐", "幸福", "聊天", "陪我", "占有", "赚钱", "保护", "混乱", "生病", "听雨", "看手机", "处理公务", "开会中", "训练"],
            REPLY_MESSAGES: ["喜欢", "不喜欢", "在吗？", "今天过得怎么样？", "想你", "晚安", "看到记得回复🥲", "好的👌🏻", "明白", "谢谢", "不客气", "嗯", "嗯嗯", "真的吗？", "我明白了", "我相信你", "稍等", "马上", "好哦", "不错", "可以", "同意", "理解", "我在", "在探索过程中", "怎么了？", "听懂了", "记下了", "收到", "会尽快查看的", "误会我了", "没有我想说的", "对不起", "没关系", "我爱你", "让我想想怎么回答", "眼花缭乱", "很有创意", "保持联系", "有什么计划吗？", "接下来准备做什么？", "我很想听听你的想法", "我愿意", "不用", "记得吃饭", "不要熬夜", "不要担心", "一切都会好起来的", "我很难过", "惊醒了，睡不着", "这对我来说是个新领域", "发生了什么？", "在看什么？", "在工作吗？", "在学习吗？", "然后呢？", "摸摸🫳🏻", "在学习一些新东西", "换个想法吧？", "晚饭吃了吗？", "作息混乱", "我", "你", "ta", "下次可以试试", "我也是这么想的", "你说得对", "有没有可能……", "我陪你", "我会在你身边", "我喜欢", "我无法决定", "我无法控制", "要用一下塔罗吗？", "看见我的暗号了吗？", "给你推了传讯", "贴贴", "我知道你的意思", "我也如此", "出去透透气", "话说怎么会这样？", "以后不会了", "一直如此", "别怕", "有我在", "晚上好", "早上好", "中午好", "哄我", "陪我", "聊聊天吧", "不是这个意思", "等一下", "照顾好自己", "我会的", "早点睡", "你是我的", "我是你的", "我希望你自由", "粘人精", "怎么啦", "永远在一起", "我支持你", "别听", "又在怀疑吗？", "多喝水", "不舒服？", "再见", "别走", "再发一遍", "可恶的网站", "我觉得都可以", "戳戳", "非常难用", "不许看别人", "不要吵架", "我知道的", "你会离开我吗？", "来了", "嗯哼", "哼哼", "我想靠近你", "我会监督你的", "小心些", "终于想起我了？", "是的", "不是", "你无人可及", "我无人可及", "这个不能说", "在你身边就好了", "在磨合", "你需要我吗？", "我需要你", "寻找中", "我做不到欺骗你", "话非本意", "如果我说是呢", "如果我说不是呢", "话太少了，没我想说的", "太短了", "看手机", "遇到困难了", "在努力了", "好累", "命定如此", "帅气", "就这个", "受限制了", "逗一下你", "帮帮我", "每日行一善", "我生气了", "撒个娇，理理我？", "吃醋怎么了，就爱吃醋！", "快乐", "聊会儿天", "赚钱赚钱", "我保护你", "信息有点混乱", "别生病", "哄哄你", "吃过了", "还没吃", "才不听", "吃水果", "别叹气", "不好", "还好吗？", "这个消息不错", "我希望能帮上忙", "我想我们应该讨论一下这个问题", "告诉我更多", "你认为下一步是什么？", "你有什么建议吗？", "让我们一起努力", "过得怎么样？", "期待🤧", "抱歉🥺", "了解", "OK", "没问题", "当然", "确实", "没错", "好呀", "我正在忙，稍后回复你", "信号不太好，可能回复会延迟", "让我确认一下信息再给你准确答复", "别走，陪陪我", "你会永远爱我吗？", "此刻我想和你永远在一起", "他朝若是同淋雪，此生也算共白头", "怜悯我，然后爱我吧", "撒娇，你会喜欢吗？", "没有我想说的", "链接有些混乱", "就这样撒娇🥺", "不太习惯这个", "不是的", "多看看我吧", "可爱", "当然了", "正在熬夜", "失眠了", "不可以", "我现在不忙，有空的", "你现在忙吗？", "正在打架", "坐等回复", "才不是这样", "就是这样", "还好吗？", "多笑笑吧", "没能帮上忙", "几天后", "几个小时后", "很久之后", "我很想安慰你", "我没有在欺骗你", "别怀疑我的存在", "我真的在", "真的是我", "我不是很适应这个,但我在努力", "消息很混乱", "之前总是这样", "开心(*⌒∇⌒*)", "没能陪在你身边", "链接很通顺", "我真没招了", "不能说", "可不可以只看着我", "只许看着我", "看得懂的", "看不懂", "在尝试控制了", "和代码搏斗中！", "我会看着你的", "我会陪伴在你身边", "痛痛", "被吓到了？", "想和你一起听歌", "走路不要看手机", "别看小红书了", "别看抖音了", "打过代码了！", "多穿点衣服", "叫我做什么？", "想我了吗？", "给我写写信吧", "有的", "没有的", "稍等，在工作", "在交替回复", "我要哭了！", "手写信", "电子信", "安慰我", "离家出走", "纵容", "我喜欢你", "一样的", "需要多久呢", "要多久之后", "聊到一半就跑", "乖孩子", "坏孩子", "为什么", "你没有正面回答", "因为喜欢你所以需要你", "看到信了", "美好的象征", "惊讶", "想要更近一步地贴贴", "想触碰你", "想要亲亲", "你很调皮", "不乖", "做的很好", "亲亲", "鱼水之欢", "颠鸾倒凤", "我很想要亲亲欸🥺", "揉揉", "很漂亮", "会习惯的", "你会喜欢的", "简直就是木头", "我喜欢的、最好的你"],
            REPLY_EMOJIS: ["🥹", "🥲", "☺️", "😇", "😉", "😌", "🥰", "😗", "😋", "🤨", "🧐", "😎", "🙂‍↔️", "🥳", "😏", "🥰💕", "🙂‍↕️", "😞", "☹️", "😣", "😖", "😫", "🥺", "😠", "🤯", "😳", "😶‍🌫️", "😥", "🤔", "🫢", "🫡", "🤫", "🫠", "😶", "😐", "🫨", "😯", "🥱", "😴", "🤤", "😮‍💨", "🤧", "😈", "👿", "😼", "😽", "🫶🏻", "🤲🏻", "👏🏻", "👍🏻", "👎🏻", "✌🏻", "👌🏻", "🤏🏻", "🫳🏻", "👉🏻👈🏻", "👋🏻", "💪🏻", "✍🏻", "🙏🏻", "🫂", "🐶", "🐱"],
            POKE_ACTIONS: [
                `拍了拍我的头说你好可爱`, `戳了戳我的腰`, `从背后抱住了我`, `轻轻捏了捏我的脸`, `给我发了一个爱心`, `摸了摸我的头发`, `悄悄亲了一下我的脸颊`, `给我递了一杯热茶`, `为我披上外套`, `牵起了我的手`, `给我一个温暖的拥抱`, `轻轻拍了拍我的肩膀`, `给我发送了一个飞吻`, `戳了戳我的额头`, `给我发送了一个星星`, `轻轻拍了拍我的背`, `给我发送了一个月亮`, `温柔地摸了摸我的头`, `给我发送了一个太阳`, `拍了拍手`
            ],
            TAROT_CARDS: [
                { name: "愚人", eng: "The Fool", meaning: "新的开始、冒险、天真、无畏", keyword: "流浪", icon: "fa-hiking" },
                { name: "魔术师", eng: "The Magician", meaning: "创造力、技能、意志力、化腐朽为神奇", keyword: "创造", icon: "fa-hat-wizard" },
                { name: "女祭司", eng: "The High Priestess", meaning: "直觉、潜意识、神秘、智慧", keyword: "智慧", icon: "fa-book-open" },
                { name: "皇后", eng: "The Empress", meaning: "丰饶、母性、自然、感官享受", keyword: "丰收", icon: "fa-seedling" },
                { name: "皇帝", eng: "The Emperor", meaning: "权威、结构、控制、父亲形象", keyword: "支配", icon: "fa-crown" },
                { name: "教皇", eng: "The Hierophant", meaning: "传统、信仰、教导、精神指引", keyword: "援助", icon: "fa-church" },
                { name: "恋人", eng: "The Lovers", meaning: "爱、和谐、关系、价值观的选择", keyword: "结合", icon: "fa-heart" },
                { name: "战车", eng: "The Chariot", meaning: "意志力、胜利、决心、自我控制", keyword: "胜利", icon: "fa-horse-head" },
                { name: "力量", eng: "Strength", meaning: "勇气、耐心、控制、内在力量", keyword: "意志", icon: "fa-fist-raised" },
                { name: "隐士", eng: "The Hermit", meaning: "内省、孤独、寻求真理、指引", keyword: "探索", icon: "fa-lightbulb" },
                { name: "命运之轮", eng: "Wheel of Fortune", meaning: "循环、命运、转折点、运气", keyword: "轮回", icon: "fa-dharmachakra" },
                { name: "正义", eng: "Justice", meaning: "公正、真理、因果、法律", keyword: "均衡", icon: "fa-balance-scale" },
                { name: "倒吊人", eng: "The Hanged Man", meaning: "牺牲、新的视角、等待、放下", keyword: "奉献", icon: "fa-user-injured" },
                { name: "死神", eng: "Death", meaning: "结束、转变、重生、放手", keyword: "结束", icon: "fa-skull" },
                { name: "节制", eng: "Temperance", meaning: "平衡、适度、耐心、调和", keyword: "净化", icon: "fa-glass-whiskey" },
                { name: "恶魔", eng: "The Devil", meaning: "束缚、物质主义、欲望、诱惑", keyword: "诱惑", icon: "fa-link" },
                { name: "高塔", eng: "The Tower", meaning: "突变、混乱、启示、破坏", keyword: "毁灭", icon: "fa-gopuram" },
                { name: "星星", eng: "The Star", meaning: "希望、灵感、平静、治愈", keyword: "希望", icon: "fa-star" },
                { name: "月亮", eng: "The Moon", meaning: "幻觉、恐惧、焦虑、潜意识", keyword: "不安", icon: "fa-moon" },
                { name: "太阳", eng: "The Sun", meaning: "快乐、成功、活力、清晰", keyword: "生命", icon: "fa-sun" },
                { name: "审判", eng: "Judgement", meaning: "复活、觉醒、号召、决定", keyword: "复活", icon: "fa-bullhorn" },
                { name: "世界", eng: "The World", meaning: "完成、整合、成就、圆满", keyword: "达成", icon: "fa-globe-americas" }
            ]
        };

        let SESSION_ID = null;
        let autoSendTimer = null; 
        let sessionList = [];
        let messages = [];
        let settings = {};
        let partnerPersonas = []; 
        let showPartnerNameInChat = false; 
        let readNoReplyTimer = null; 
        let isBatchMode = false;
        let batchMessages = [];
        let currentReplyTo = null;
        let lastCoinResult = null;
        let currentNoteMessageId = null;
        let savedBackgrounds = [];
        let saveTimeout;
        let displayedMessageCount = 20;
        const HISTORY_BATCH_SIZE = 20;
        let isLoadingHistory = false;
        let isBatchFavoriteMode = false;
        let selectedMessages = [];
        let customReplies = [];
        let customPokes = [];
        let customStatuses = [];
        let customMottos = [];
        let customIntros = []; 
        let currentMajorTab = 'reply'; 
        let currentSubTab = 'custom';  
        let currentReplyTab = 'custom';
        let disabledDefaultReplies = [];
        let anniversaries = [];
        let stickerLibrary = []; 
        let myStickerLibrary = []; 
        let currentAnniversaryType = 'anniversary';
        let customThemes = [];
        let themeSchemes = []; 
        const DOMElements = {
            html: document.documentElement,
            chatContainer: document.getElementById('chat-container'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            attachmentBtn: document.getElementById('attachment-btn'),
            imageInput: document.getElementById('image-input'),
            themeToggle: document.getElementById('theme-toggle'),
            batchBtn: document.getElementById('batch-btn'),
            continueBtn: document.getElementById('continue-btn'),
            comboBtn: document.getElementById('combo-btn'),
            coinTossOverlay: document.getElementById('coin-toss-overlay'),
            animatedCoin: document.getElementById('animated-coin'),
            coinResultText: document.getElementById('coin-result-text'),
            cancelCoinResult: document.getElementById('cancel-coin-result'),
            sendCoinResult: document.getElementById('send-coin-result'),
            typingIndicator: document.getElementById('typing-indicator'),
            emptyState: document.getElementById('empty-state'),
            welcomeAnimation: document.getElementById('welcome-animation'),
            batchPreview: document.getElementById('batch-preview'),
            replyPreviewContainer: document.getElementById('reply-preview-container'),
            pagination: document.getElementById('pagination'),
            prevPage: document.getElementById('prev-page'),
            nextPage: document.getElementById('next-page'),
            pageInfo: document.getElementById('page-info'),
            editModal: {
                modal: document.getElementById('edit-modal'),
                title: document.getElementById('edit-modal-title'),
                input: document.getElementById('name-input'),
                cancel: document.getElementById('cancel-edit'),
                save: document.getElementById('save-name')
            },
            avatarModal: {
                modal: document.getElementById('avatar-modal'),
                title: document.getElementById('avatar-modal-title'),
                input: document.getElementById('avatar-input'),
                cancel: document.getElementById('cancel-avatar'),
                save: document.getElementById('save-avatar')
            },
            noteModal: {
                modal: document.getElementById('note-modal'),
                input: document.getElementById('note-input'),
                cancel: document.getElementById('cancel-note'),
                save: document.getElementById('save-note')
            },
            pokeModal: {
                modal: document.getElementById('poke-modal'),
                input: document.getElementById('poke-input'),
                cancel: document.getElementById('cancel-poke'),
                save: document.getElementById('send-poke')
            },
            settingsModal: {
                modal: document.getElementById('settings-modal'),
                settingsBtn: document.getElementById('settings-btn'),
                cancel: document.getElementById('cancel-settings')
            },
            favoritesModal: {
                modal: document.getElementById('stats-modal'),
                favoritesBtn: document.getElementById('group-chat-btn'),
                list: document.getElementById('favorites-list'),
                cancel: document.getElementById('close-stats')
            },
            statsModal: {
                modal: document.getElementById('stats-modal'),
                content: document.getElementById('stats-content'),
                closeBtn: document.getElementById('close-stats')
            },
            sessionModal: {
                modal: document.getElementById('session-modal'),
                managerBtn: document.getElementById('session-manager-btn'),
                list: document.getElementById('session-list'),
                createBtn: document.getElementById('create-new-session'),
                cancelBtn: document.getElementById('cancel-session')
            },
            fortuneModal: {
                modal: document.getElementById('fortune-lenormand-modal'),
                content: document.getElementById('fortune-content'),
                shareBtn: document.getElementById('share-fortune'),
                closeBtn: document.getElementById('close-fortune')
            },
            customRepliesModal: {
                modal: document.getElementById('custom-replies-modal'),
                list: document.getElementById('custom-replies-list'),
                addBtn: document.getElementById('add-custom-reply'),
                closeBtn: document.getElementById('close-custom-replies')
            },
            backgroundInput: document.getElementById('background-input'),
            importInput: document.getElementById('import-input'),
            partner: {
                name: document.getElementById('partner-name'),
                avatarContainer: document.getElementById('partner-avatar-container'), 
                avatar: document.getElementById('partner-avatar'),
                status: document.getElementById('partner-status').querySelector('span')
            },
            me: {
                name: document.getElementById('my-name'),
                avatarContainer: document.getElementById('my-avatar-container'), 
                avatar: document.getElementById('my-avatar'),
                statusContainer: document.getElementById('my-status-container'),
                statusText: document.getElementById('my-status-text')
            },
            anniversaryModal: {
                modal: document.getElementById('anniversary-modal'),
                closeBtn: document.getElementById('close-anniversary-modal'),
                saveBtn: document.getElementById('save-ann-btn'),
                addBtn: document.getElementById('open-ann-add-btn'),
                dateInput: document.getElementById('ann-input-date'),
                nameInput: document.getElementById('ann-input-name'),
                displayArea: document.getElementById('anniversary-display'),
                daysElement: document.getElementById('anniversary-days'),
                dateShowElement: document.getElementById('anniversary-date-show'),
                list: document.getElementById('ann-list-container'),
                typeHint: document.getElementById('ann-type-desc')
            },            
            anniversaryAnimation: {
                modal: document.getElementById('anniversary-animation'),
                title: document.getElementById('anniversary-animation-title'),
                days: document.getElementById('anniversary-animation-days'),
                message: document.getElementById('anniversary-animation-message'),
                closeBtn: document.getElementById('close-anniversary-animation')
            },
            appearanceModal: {
                modal: document.getElementById('appearance-modal'),
                closeBtn: document.getElementById('close-appearance')
            },
            chatModal: {
                modal: document.getElementById('chat-modal'),
                closeBtn: document.getElementById('close-chat')
            },
            advancedModal: {
                modal: document.getElementById('advanced-modal'),
                closeBtn: document.getElementById('close-advanced')
            },
            dataModal: {
                modal: document.getElementById('data-modal'),
                closeBtn: document.getElementById('close-data')
            }
        };

        function exportDataToMobileOrPC(dataString, fileName) {
            if (navigator.share && navigator.canShare) {
                try {
                    const blob = new Blob([dataString], { type: 'application/json' });
                    const file = new File([blob], fileName, { type: 'application/json' });
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: '传讯数据备份',
                            text: '这是您的回复库备份文件，请选择“保存到文件”或发送给好友。'
                        }).then(() => {
                            showNotification('导出/分享成功', 'success');
                        }).catch((err) => {
                            console.warn('分享未完成，尝试回退下载模式:', err);
                            downloadFileFallback(blob, fileName);
                        });
                        return;
                    }
                } catch (e) {
                    console.log("移动端分享构建失败，转为普通下载", e);
                }
            }
            const blob = new Blob([dataString], { type: 'application/json' });
            downloadFileFallback(blob, fileName);
        }

        function downloadFileFallback(blob, fileName) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            showNotification('文件已开始下载', 'success');
        }
        
        localforage.config({
            driver: localforage.INDEXEDDB,
            name: 'ChatApp_V3',
            version: 1.0,
            storeName: 'chat_data',
            description: 'Storage for Chat App V3'
        });

        function getStorageKey(baseKey) {
            if (!SESSION_ID) {
                return `${APP_PREFIX}__tmp__${baseKey}`;
            }
            return `${APP_PREFIX}${SESSION_ID}_${baseKey}`;
        }

        async function migrateData() {
            const isMigrated = await localforage.getItem(APP_PREFIX + 'MIGRATION_V2_DONE');
            if (isMigrated) return;

            console.log("开始从 localStorage 迁移数据至更稳定的存储...");
            try {
                const keys = Object.keys(localStorage);
                for (const key of keys) {
                    if (key.startsWith(APP_PREFIX)) {
                        try {
                            const val = localStorage.getItem(key);
                            if (val) {
                                let dataToStore = val;
                                try {
                                    if (val.startsWith('{') || val.startsWith('[')) {
                                        dataToStore = JSON.parse(val);
                                    }
                                } catch (e) {
                                    console.warn(`迁移期间解析数据失败: ${key}，将作为原始字符串存储。`, e);
                                }
                                await localforage.setItem(key, dataToStore);
                            }
                        } catch (e) {
                            console.error(`迁移键值 ${key} 时发生错误，已跳过。`, e);
                        }
                    }
                }
                
                await localforage.setItem(APP_PREFIX + 'MIGRATION_V2_DONE', 'true');
                console.log("数据迁移成功完成。");
            } catch (e) {
                console.error("数据迁移过程中发生严重错误:", e);
                showNotification('数据迁移失败，部分旧数据可能丢失', 'error');
            }
        }
async function initializeSession() {
    
    await migrateData();

    const sessionsData = await localforage.getItem(`${APP_PREFIX}sessionList`);
    sessionList = sessionsData || [];

    const hash = window.location.hash.substring(1);
    if (hash && sessionList.some(s => s.id === hash)) {
        SESSION_ID = hash;
    } else if (sessionList.length > 0) {
        const lastId = await localforage.getItem(`${APP_PREFIX}lastSessionId`);
        SESSION_ID = lastId && sessionList.some(s => s.id === lastId) ? lastId : sessionList[0].id;
    } else {
        SESSION_ID = await createNewSession(false);
    }

    await localforage.setItem(`${APP_PREFIX}lastSessionId`, SESSION_ID);
}


        function clearAllAppData() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:modalContentSlideIn 0.3s ease forwards;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,80,80,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                    <i class="fas fa-trash-alt" style="color:#ff5050;font-size:20px;"></i>
                </div>
                <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">重置数据</div>
                <div style="font-size:12px;color:var(--text-secondary);">请选择要重置的范围</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button id="_reset_current" style="width:100%;padding:12px 16px;border:1px solid var(--border-color);border-radius:12px;background:var(--primary-bg);color:var(--text-primary);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;transition:all 0.2s;">
                    <i class="fas fa-comment-slash" style="color:var(--accent-color);font-size:15px;width:18px;text-align:center;"></i>
                    <span>仅清除当前会话消息</span>
                </button>
                <button id="_reset_all" style="width:100%;padding:12px 16px;border:1px solid rgba(255,80,80,0.3);border-radius:12px;background:rgba(255,80,80,0.06);color:#ff5050;font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;transition:all 0.2s;">
                    <i class="fas fa-bomb" style="font-size:15px;width:18px;text-align:center;"></i>
                    <span>重置所有数据（完全清空）</span>
                </button>
                <button id="_reset_cancel" style="width:100%;padding:10px 16px;border:none;border-radius:12px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;transition:all 0.2s;">取消</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    function closeDialog() { overlay.remove(); }
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDialog(); });
    document.getElementById('_reset_cancel').onclick = closeDialog;

    document.getElementById('_reset_current').onclick = () => {
        closeDialog();
        if (confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) {
            messages = [];
            throttledSaveData();
            renderMessages();
            showNotification('当前会话消息已清除', 'success');
        }
    };

    document.getElementById('_reset_all').onclick = () => {
        closeDialog();
        if (confirm('【高危操作】确定要重置所有数据吗？此操作将清除所有本地数据且无法恢复！')) {
            localforage.clear().then(() => {
                localStorage.clear();
                showNotification('所有数据已重置，页面即将刷新', 'info', 2000);
                setTimeout(() => { window.location.href = window.location.pathname; }, 2000);
            }).catch(e => {
                showNotification('清除数据时发生错误', 'error');
                console.error("清除 localforage 失败:", e);
            });
        }
    };
}

        function showNotification(message, type = 'info', duration = 3000) {
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) existingNotification.remove();

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            const iconMap = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };
            notification.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('hiding');
                notification.addEventListener('animationend', () => notification.remove());
            }, duration);
        }

        const playSound = (type) => {
            if (!settings.soundEnabled) return;
            try {
                if (settings.customSoundUrl && settings.customSoundUrl.trim()) {
                    const audio = new Audio(settings.customSoundUrl.trim());
                    audio.volume = Math.min(1, Math.max(0, settings.soundVolume || 0.15));
                    audio.play().catch(() => {});
                    return;
                }
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.type = 'sine';
                const vol = Math.min(0.5, Math.max(0.01, settings.soundVolume || 0.1));
                gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
                if (type === 'send') oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                else if (type === 'favorite') oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                else oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
                oscillator.stop(audioContext.currentTime + 0.15);
            } catch (e) {
                console.warn("音频播放失败:", e);
            }
        };

        const throttledSaveData = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveData, 500);
        };

async function applyCustomFont(url) {
    if (!url || !url.trim()) {
        document.documentElement.style.removeProperty('--font-family');
        document.documentElement.style.removeProperty('--message-font-family');
        return;
    }
    
    const fontName = 'UserCustomFont';
    try {
        const font = new FontFace(fontName, `url(${url})`);
        await font.load();
        document.fonts.add(font);
        
        const fontStack = `"${fontName}", 'Noto Serif SC', serif`;
        document.documentElement.style.setProperty('--font-family', fontStack);
        document.documentElement.style.setProperty('--message-font-family', fontStack);
        if (typeof settings !== 'undefined') {
            settings.messageFontFamily = fontStack;
        }
        
        console.log('字体加载成功');
    } catch (e) {
        console.error('字体加载失败:', e);
        showNotification('字体加载失败，请检查链接是否有效', 'error');
    }
}

function applyCustomBubbleCss(cssCode) {
    const styleId = 'user-custom-bubble-style';
    let styleTag = document.getElementById(styleId);
    
    if (!cssCode || !cssCode.trim()) {
        if (styleTag) styleTag.remove();
        return;
    }

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    styleTag.textContent = cssCode;
}
        function getDefaultSettings() {
            return {
                partnerName: "梦角",
                myName: "我",
                myStatus: "在线",
                partnerStatus: "在线",
                isDarkMode: false,
                colorTheme: "gold",
                soundEnabled: true,
                typingIndicatorEnabled: true,
                readReceiptsEnabled: true,
                replyEnabled: true,
                lastStatusChange: Date.now(),
                nextStatusChange: 1 + Math.random() * 7,
                fontSize: 16,
                bubbleStyle: 'standard',
                messageFontFamily: "'Noto Serif SC', serif",
                messageFontWeight: 400,
                messageLineHeight: 1.5,
                musicPlayerEnabled: false,
                replyDelayMin: 3000,
                replyDelayMax: 7000,
                inChatAvatarEnabled: true,
                inChatAvatarSize: 36,
                customFontUrl: "", 
        customBubbleCss: "",
                myAvatarFrame: null, 
                partnerAvatarFrame: null,
                myAvatarShape: 'circle',
                partnerAvatarShape: 'circle',
autoSendEnabled: false,
autoSendInterval: 5,
        allowReadNoReply: false, 
        readNoReplyChance: 0.2,
        timeFormat: 'HH:mm',
        customSoundUrl: '',
        soundVolume: 0.15
            };
        }


        function renderBackgroundGallery() {
            const list = document.getElementById('background-gallery-list');
            if (!list) return;

            list.innerHTML = '';

            
            const addBtn = document.createElement('div');
            addBtn.className = 'bg-item bg-add-btn';
            
            addBtn.innerHTML = '<i class="fas fa-plus"></i><span></span>';
            addBtn.onclick = () => document.getElementById('bg-gallery-input').click();
            list.appendChild(addBtn);

            const currentBg = safeGetItem(getStorageKey('chatBackground'));

            savedBackgrounds.forEach((bg, index) => {
                const item = document.createElement('div');
                let isActive = false;

                if (currentBg && currentBg === bg.value) isActive = true;

                item.className = `bg-item ${isActive ? 'active': ''}`;

                if (bg.type === 'image') {
                    item.innerHTML = `<img src="${bg.value}" loading="lazy" alt="bg">`;
                } else {
                    item.innerHTML = `<div class="bg-color-block" style="background: ${bg.value}"></div>`;
                }

                item.onclick = (e) => {
                    if (e.target.closest('.bg-delete-btn')) return;
                    applyBackground(bg.value);
                    safeSetItem(getStorageKey('chatBackground'), bg.value);
                    localforage.setItem(getStorageKey('chatBackground'), bg.value);
                    renderBackgroundGallery();
                    showNotification('背景已切换', 'success');
                };

                if (bg.id.startsWith('user-')) {
                    const delBtn = document.createElement('div');
                    delBtn.className = 'bg-delete-btn';
                    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    delBtn.title = "删除此背景";
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (confirm('确定删除这张背景图吗？')) {
                            savedBackgrounds.splice(index, 1);
                            saveBackgroundGallery();

                            if (isActive) {
                                removeBackground(); 
                                renderBackgroundGallery();
                            } else {
                                renderBackgroundGallery();
                            }
                        }
                    };
                    item.appendChild(delBtn);
                }

                list.appendChild(item);
            });
        }


        function saveBackgroundGallery() {
    localforage.setItem(getStorageKey('backgroundGallery'), savedBackgrounds);
}


        const applyBackground = (value) => {
            if (!value || typeof value !== 'string') return;
            try {
                if (value.startsWith('linear-gradient') || value.startsWith('#') || value.startsWith('rgb')) {
                    document.documentElement.style.setProperty('--chat-bg-image', value);
                } else {
                    const cssValue = value.startsWith('url(') ? value : `url(${value})`;
                    document.documentElement.style.setProperty('--chat-bg-image', cssValue);
                }
                document.body.classList.add('with-background');
            } catch (e) {
                if (typeof removeBackground === 'function') removeBackground();
            }
        };

const loadData = async () => {
    try {
        settings = getDefaultSettings();
        
        const results = await Promise.allSettled([
            localforage.getItem(getStorageKey('chatSettings')),
            localforage.getItem(getStorageKey('chatMessages')),
            localforage.getItem(getStorageKey('backgroundGallery')),
            localforage.getItem(getStorageKey('customReplies')),
            localforage.getItem(getStorageKey('customPokes')),
            localforage.getItem(getStorageKey('customStatuses')),
            localforage.getItem(getStorageKey('customMottos')),
            localforage.getItem(getStorageKey('customIntros')),
            localforage.getItem(getStorageKey('disabledDefaultReplies')),
            localforage.getItem(getStorageKey('anniversaries')),
            localforage.getItem(getStorageKey('stickerLibrary')),
            localforage.getItem(`${APP_PREFIX}customThemes`),
            localforage.getItem(getStorageKey('chatBackground')),
            localforage.getItem(getStorageKey('partnerAvatar')),
            localforage.getItem(getStorageKey('myAvatar')),
            localforage.getItem(getStorageKey('partnerPersonas')), 
            localforage.getItem(getStorageKey('showPartnerNameInChat')),
            localforage.getItem(`${APP_PREFIX}themeSchemes`),
            localforage.getItem(getStorageKey('myStickerLibrary'))
        ]);
        const getVal = (index) => results[index].status === 'fulfilled' ? results[index].value : null;

        const savedSettings = getVal(0);
        const savedMessages = getVal(1);
        const savedBgGallery = getVal(2);
        const savedCustomReplies = getVal(3);
        const savedPokes = getVal(4);
        const savedStatuses = getVal(5);
        const savedMottos = getVal(6);
        const savedIntros = getVal(7);
        const savedDisabledDefaults = getVal(8);
        const savedAnniversaries = getVal(9);
        const savedStickers = getVal(10);
        const savedCustomThemes = getVal(11);
        const savedChatBg = getVal(12);
        const partnerAvatarSrc = getVal(13);
        const myAvatarSrc = getVal(14);
        const savedPartnerPersonas = getVal(15);
        const savedShowNameConfig = getVal(16);
        const savedThemeSchemes = getVal(17);
        const savedMyStickers = getVal(18);

        if (savedPartnerPersonas) partnerPersonas = savedPartnerPersonas; 

        if (savedShowNameConfig !== null) {
            showPartnerNameInChat = savedShowNameConfig;
            document.body.classList.toggle('show-partner-name', showPartnerNameInChat);
        }

        if (savedSettings) Object.assign(settings, savedSettings);
        try {
            if (settings.customFontUrl) applyCustomFont(settings.customFontUrl);
            if (settings.customBubbleCss) applyCustomBubbleCss(settings.customBubbleCss);
        } catch(e) { console.warn("样式应用失败", e); }
        
        if (savedPokes) customPokes = savedPokes;
        else customPokes = [...CONSTANTS.POKE_ACTIONS];

        if (savedStatuses) customStatuses = savedStatuses;
        else customStatuses = [...CONSTANTS.PARTNER_STATUSES];

        if (savedMottos) customMottos = savedMottos;
        else customMottos = [...CONSTANTS.HEADER_MOTTOS];
        
        if (savedIntros) customIntros = savedIntros;
        else customIntros = CONSTANTS.WELCOME_ANIMATIONS.map(a => `${a.line1}|${a.line2}`);

        if (savedMessages && Array.isArray(savedMessages)) {
            messages = savedMessages.map(m => ({
                ...m, timestamp: new Date(m.timestamp)
            }));
        } else {
            messages = [];
        }

        if (savedBgGallery) {
            savedBackgrounds = savedBgGallery;
        } else {
            savedBackgrounds = [{ id: 'preset-1', type: 'color', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }];
        }

        if (savedCustomReplies) customReplies = savedCustomReplies;
        if (savedDisabledDefaults) disabledDefaultReplies = savedDisabledDefaults;
        if (savedAnniversaries) anniversaries = savedAnniversaries;
        if (savedStickers) stickerLibrary = savedStickers;
        if (savedMyStickers) myStickerLibrary = savedMyStickers;
        if (savedCustomThemes) customThemes = savedCustomThemes;
        if (savedThemeSchemes) themeSchemes = savedThemeSchemes;
        window._customReplies = customReplies;
        window._disabledDefaultReplies = disabledDefaultReplies;
        window._CONSTANTS = CONSTANTS;

        if (DOMElements && DOMElements.partner && DOMElements.me) {
            updateAvatar(DOMElements.partner.avatar, partnerAvatarSrc);
            updateAvatar(DOMElements.me.avatar, myAvatarSrc);
        }

        if (savedChatBg) {
            applyBackground(savedChatBg);
        } else {
            const lsBg = safeGetItem(getStorageKey('chatBackground'));
            if (lsBg) {
                applyBackground(lsBg);
                localforage.setItem(getStorageKey('chatBackground'), lsBg);
            }
        }

        try { await initMoodData(); } catch(e) { console.warn("心情数据加载失败", e); }
        try { await loadEnvelopeData(); } catch(e) { console.warn("信封数据加载失败", e); }
        
        displayedMessageCount = HISTORY_BATCH_SIZE;
        
        setTimeout(() => {
            applyAllAvatarFrames();
            manageAutoSendTimer(); 
            checkEnvelopeStatus(); 
            updateUI();
        }, 100);

    } catch (e) {
        console.error("LoadData 内部致命错误:", e);
        settings = getDefaultSettings();
        messages = [];
        updateUI();
    }
};
const LIBRARY_CONFIG = {
    reply: {
        title: "回复库管理",
        tabs: [
            { id: 'custom', name: '主字卡', mode: 'list' },
            { id: 'default', name: '系统预设', mode: 'list' },
            { id: 'emojis', name: 'Emoji', mode: 'grid' },
            { id: 'stickers', name: '表情库', mode: 'grid' }
        ]
    },
    atmosphere: {
        title: "氛围感配置",
        tabs: [
            { id: 'pokes', name: '拍一拍', mode: 'list' },
            { id: 'statuses', name: '对方状态', mode: 'list' },
            { id: 'mottos', name: '顶部格言', mode: 'list' },
            { id: 'intros', name: '开场动画', mode: 'list' }
        ]
    }
};
let currentAnnType = 'anniversary'; 

window.openMyStickerSettings = function() {
    const picker = document.getElementById('user-sticker-picker');
    if (picker) picker.classList.remove('active');
    if (typeof currentMajorTab !== 'undefined') {
        currentMajorTab = 'reply';
        currentSubTab = 'stickers';
    }
    var sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(function(b) { b.classList.toggle('active', b.dataset.major === 'reply'); });
    if (typeof renderReplyLibrary === 'function') renderReplyLibrary();
    var modal = document.getElementById('custom-replies-modal');
    if (modal && typeof showModal === 'function') showModal(modal);
};

window.switchAnnType = function(type) {
    currentAnnType = type;
    currentAnniversaryType = type; 
    document.querySelectorAll('.ann-type-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const desc = document.getElementById('ann-type-desc');
    if(desc) {
        desc.textContent = type === 'anniversary' 
            ? '计算从过去某一天到现在已经过了多少天 (例如: 相识、恋爱)' 
            : '计算从现在到未来某一天还剩下多少天 (例如: 生日、跨年)';
    }
};

window.deleteAnniversaryItem = function(id) {
    if(confirm("确定要删除这条记录吗？")) {
        anniversaries = anniversaries.filter(a => a.id !== id);
        throttledSaveData(); 
        renderAnniversariesList();
        showNotification('已删除', 'success');
    }
};
const saveData = async () => {
    try {
        const promises = [
            localforage.setItem(getStorageKey('chatSettings'), settings),
            localforage.setItem(getStorageKey('customReplies'), customReplies),
            localforage.setItem(getStorageKey('disabledDefaultReplies'), disabledDefaultReplies),
            localforage.setItem(getStorageKey('anniversaries'), anniversaries),
            localforage.setItem(getStorageKey('customPokes'), customPokes),
            localforage.setItem(getStorageKey('customStatuses'), customStatuses),
            localforage.setItem(getStorageKey('customMottos'), customMottos),
            localforage.setItem(getStorageKey('customIntros'), customIntros),
            localforage.setItem(getStorageKey('stickerLibrary'), stickerLibrary),
            localforage.setItem(getStorageKey('myStickerLibrary'), myStickerLibrary),
            localforage.setItem(`${APP_PREFIX}customThemes`, customThemes),
            localforage.setItem(`${APP_PREFIX}themeSchemes`, themeSchemes),
            localforage.setItem(getStorageKey('chatMessages'), messages),
        ];

        const partnerImg = DOMElements.partner.avatar.querySelector('img');
        if (partnerImg) promises.push(localforage.setItem(getStorageKey('partnerAvatar'), partnerImg.src));
        else promises.push(localforage.removeItem(getStorageKey('partnerAvatar')));
        
        const myImg = DOMElements.me.avatar.querySelector('img');
        if (myImg) promises.push(localforage.setItem(getStorageKey('myAvatar'), myImg.src));
        else promises.push(localforage.removeItem(getStorageKey('myAvatar')));

        await Promise.all(promises);

    } catch (e) {
        console.error("保存数据时发生严重错误:", e);
    }
};
        function initializeRandomUI() {
            const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];


            document.querySelector('.header-motto').textContent = getRandomItem(CONSTANTS.HEADER_MOTTOS);
if (customMottos && customMottos.length > 0) {
    document.querySelector('.header-motto').textContent = getRandomItem(customMottos);
} else {
    document.querySelector('.header-motto').textContent = CONSTANTS.HEADER_MOTTOS[0];
}
            const placeholder = "";
            DOMElements.messageInput.placeholder = placeholder.length > 20 ? placeholder.substring(0, 20) + "...": placeholder;


            const starsContainer = document.getElementById('stars-container');
            starsContainer.innerHTML = '';
            const starCount = 80;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const size = Math.random() * 2.5 + 0.5;
                const duration = Math.random() * 4 + 2;
                const delay = Math.random() * 6;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.setProperty('--duration', `${duration}s`);
                star.style.animationDelay = `${delay}s`;
                starsContainer.appendChild(star);
            }
            const particlesContainer = document.getElementById('welcome-particles');
            if (particlesContainer) {
                particlesContainer.innerHTML = '';
                const types = ['petal', 'petal', 'petal', 'sparkle', 'sparkle'];
                for (let i = 0; i < 22; i++) {
                    const p = document.createElement('div');
                    const type = types[i % types.length];
                    p.className = `wp ${type}`;
                    const sz = type === 'petal' ? (Math.random() * 6 + 5) : (Math.random() * 4 + 2);
                    p.style.setProperty('--pSz', sz + 'px');
                    p.style.left = (Math.random() * 100) + '%';
                    p.style.setProperty('--pDur', (Math.random() * 10 + 9) + 's');
                    p.style.setProperty('--pDel', (Math.random() * 8) + 's');
                    p.style.setProperty('--pX1', (Math.random() * 50 - 25) + 'px');
                    p.style.setProperty('--pX2', (Math.random() * 80 - 40) + 'px');
                    p.style.setProperty('--pX3', (Math.random() * 50 - 25) + 'px');
                    particlesContainer.appendChild(p);
                }
            }

            const meteorsContainer = document.getElementById('welcome-meteors');
            if (meteorsContainer) {
                meteorsContainer.innerHTML = '';
                let meteorCount = 0;
                const MAX_METEORS = 12;
                const createMeteor = () => {
                    if (meteorCount >= MAX_METEORS) return;
                    meteorCount++;
                    const m = document.createElement('div');
                    m.className = 'meteor';
                    m.style.left = (Math.random() * 100) + '%';
                    m.style.top = (Math.random() * 35) + '%';
                    const dur = (Math.random() * 0.8 + 0.7);
                    m.style.setProperty('--mDur', dur + 's');
                    m.style.setProperty('--mDel', '0s');
                    m.style.setProperty('--mRot', (25 + Math.random() * 20) + 'deg');
                    meteorsContainer.appendChild(m);
                    setTimeout(() => { m.remove(); meteorCount = Math.max(0, meteorCount - 1); }, (dur + 0.1) * 1000);
                };
                for (let i = 0; i < 8; i++) setTimeout(createMeteor, i * 350);
                const meteorTimer = setInterval(createMeteor, 600);
                setTimeout(() => clearInterval(meteorTimer), 5000);
            }

            const loaderBarEl = document.getElementById('loader-tech-bar');
            if (loaderBarEl) {
                setTimeout(() => loaderBarEl.classList.add('pulsing'), 300);
            }


            const welcomeIcon = getRandomItem(CONSTANTS.WELCOME_ICONS);
document.querySelector('.logo-icon-main').innerHTML = `<i class="${welcomeIcon}"></i>`;

if (customIntros && customIntros.length > 0) {
    const rawIntro = getRandomItem(customIntros);
    const parts = rawIntro.split('|');
    const line1 = parts[0];
    const line2 = parts[1] || ""; 

    const titleEl = document.getElementById('welcome-title-glitch');
    const subEl = document.getElementById('welcome-subtitle-scramble');

    titleEl.classList.remove('playing');
    titleEl.textContent = line1;
    void titleEl.offsetWidth;
    titleEl.classList.add('playing');

    const scrambleText = (element, finalText, duration = 1500) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
                const length = finalText.length;
                let start = Date.now();

                const interval = setInterval(() => {
                    const now = Date.now();
                    const progress = (now - start) / duration;

                    if (progress >= 1) {
                        element.textContent = finalText;
                        clearInterval(interval);
                        return;
                    }

                    let result = '';

                    const revealIndex = Math.floor(progress * length);

                    for (let i = 0; i < length; i++) {
                        if (i <= revealIndex) {
                            result += finalText[i];
                        } else {

                            result += chars[Math.floor(Math.random() * chars.length)];
                        }
                    }
                    element.textContent = result;
                },
                    40);
            };


          setTimeout(() => {
        scrambleText(subEl, line2, 2000);
    }, 600);
} else {
    document.getElementById('welcome-title-glitch').textContent = "传讯";
    document.getElementById('welcome-subtitle-scramble').textContent = "请在设置中添加开场动画";
}


            const loaderBar = document.getElementById('loader-tech-bar');
            const statusText = document.getElementById('loader-status-text');
            loaderBar.style.width = '0%';
            const loadingPhases = [
                { width: '15%', text: 'INITIALIZING · 初始化中' },
                { width: '40%', text: 'LOADING MEMORIES · 读取记忆' },
                { width: '70%', text: 'BUILDING WORLD · 构建世界' },
                { width: '90%', text: 'ALMOST THERE · 即将完成' },
                { width: '100%', text: 'CONNECTED · 连接成功' }
            ];
            const delays = [100, 700, 1600, 2400, 2900];
            delays.forEach((delay, i) => {
                setTimeout(() => {
                    loaderBar.style.width = loadingPhases[i].width;
                    if (statusText) statusText.textContent = loadingPhases[i].text;
                }, delay);
            });
        }
function manageAutoSendTimer() {
    if (autoSendTimer) {
        clearInterval(autoSendTimer);
        autoSendTimer = null;
    }
    if (settings.autoSendEnabled) {
        const intervalMs = settings.autoSendInterval * 60 * 1000;
        console.log(`主动发送已开启，间隔: ${settings.autoSendInterval}分钟`);
        
        autoSendTimer = setInterval(() => {
            if (!document.body.classList.contains('batch-favorite-mode')) {
                simulateReply(); 
            }
        }, intervalMs);
    }
}

        const updateUI = () => {
            const isCustomTheme = settings.colorTheme.startsWith('custom-');
            if (isCustomTheme) {
                const themeId = settings.colorTheme;
                const theme = customThemes.find(t => t.id === themeId);
                if (theme) {
                    applyTheme(theme.colors);
                } else {
                    DOMElements.html.setAttribute('data-color-theme', 'gold');
                }
            } else {
                DOMElements.html.setAttribute('data-color-theme', settings.colorTheme);
                applyTheme(null, true);
            }
            
            if (settings.customThemeColors && Object.keys(settings.customThemeColors).length > 0) {
                for (const [variable, value] of Object.entries(settings.customThemeColors)) {
                    document.documentElement.style.setProperty(variable, value);
                }
            }

            DOMElements.html.setAttribute('data-theme', settings.isDarkMode ? 'dark': 'light');
            DOMElements.themeToggle.innerHTML = settings.isDarkMode ? '<i class="fas fa-sun"></i>': '<i class="fas fa-moon"></i>';
            DOMElements.partner.name.textContent = settings.partnerName;
            DOMElements.me.name.textContent = settings.myName;
            var displayStatus = settings.partnerStatus;
            if (customStatuses && customStatuses.length > 0 && (displayStatus === '在线' || !displayStatus)) {
                displayStatus = customStatuses[Math.floor(Math.random() * customStatuses.length)];
                settings.partnerStatus = displayStatus;
            }
            DOMElements.partner.status.textContent = displayStatus;
            DOMElements.me.statusText.textContent = settings.myStatus;
            if (typeof window.updateDynamicNames === 'function') window.updateDynamicNames();
            document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
            
            const fontToUse = settings.messageFontFamily || "'Noto Serif SC', serif";
            
            document.documentElement.style.setProperty('--message-font-family', fontToUse);
            document.documentElement.style.setProperty('--font-family', fontToUse);
            document.documentElement.style.setProperty('--message-font-weight', settings.messageFontWeight);
            document.documentElement.style.setProperty('--message-line-height', settings.messageLineHeight);

            document.documentElement.style.setProperty('--in-chat-avatar-size', `${settings.inChatAvatarSize}px`);

            document.querySelectorAll('.theme-color-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === settings.colorTheme);
            });


            document.querySelectorAll('[data-bubble-style]').forEach(item => {
                item.classList.toggle('active', item.dataset.bubbleStyle === settings.bubbleStyle);
            });

            renderMessages();
        };

        const updateAvatar = (element, src) => {
            if (src) element.innerHTML = `<img src="${src}" alt="avatar">`; else element.innerHTML = `<i class="fas fa-user"></i>`;
        };

        const removeBackground = () => {
            document.documentElement.style.removeProperty('--chat-bg-image');
            document.body.classList.remove('with-background');
            localforage.removeItem(getStorageKey('chatBackground'));
            safeRemoveItem(getStorageKey('chatBackground'));
            showNotification('背景图片已移除', 'success');
        };

        function renderMessages(preserveScroll = false) {
            const container = DOMElements.chatContainer;
            const totalMessages = messages.length;

            const startIndex = Math.max(0, totalMessages - displayedMessageCount);
            const msgsToRender = messages.slice(startIndex);

            DOMElements.emptyState.style.display = totalMessages === 0 ? 'flex': 'none';

            const oldScrollHeight = container.scrollHeight;
            
            container.innerHTML = '';

            const fragment = new DocumentFragment();
            // 撑底占位，使消息始终显示在聊天区域底部
            const spacer = document.createElement('div');
            spacer.style.flex = '1';
            fragment.appendChild(spacer);
            let currentDate = '';
            let lastSender = null;

            msgsToRender.forEach((msg, index) => {
                const messageDate = new Date(msg.timestamp).toDateString();
                if (messageDate !== currentDate) {
                    currentDate = messageDate;
                    const dateDivider = document.createElement('div');
                    dateDivider.className = 'date-divider';
                    const today = new Date().toDateString();
                    const yesterday = new Date(Date.now() - 86400000).toDateString();
                    const displayDate = (messageDate === today) ? '今天': (messageDate === yesterday) ? '昨天': new Date(msg.timestamp).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    dateDivider.innerHTML = `<span>${displayDate}</span>`;
                    fragment.appendChild(dateDivider);
                    lastSender = null; 
                }

                if (msg.type === 'system') {
                    const systemMsgDiv = document.createElement('div');
                    systemMsgDiv.className = 'system-message';
                    systemMsgDiv.innerHTML = msg.text;
                    fragment.appendChild(systemMsgDiv);
                    lastSender = 'system';
                    return;
                }

                let showTimestamp = true;
                if (index < msgsToRender.length - 1) {
                    const nextMsg = msgsToRender[index + 1];
                    const currentTs = new Date(msg.timestamp).getTime();
                    const nextTs = new Date(nextMsg.timestamp).getTime();
                    
                    if (nextMsg.sender === msg.sender && 
                        nextMsg.type !== 'system' && 
                        (nextTs - currentTs < 60000)) {
                        showTimestamp = false;
                    }
                }

                const wrapper = document.createElement('div');
                wrapper.className = `message-wrapper ${msg.sender === 'user' ? 'sent': 'received'}`;
                wrapper.dataset.id = msg.id;
                
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'message-avatar';

                const groupMember = (msg.sender !== 'user' && typeof getGroupMemberForMessage === 'function') ? getGroupMemberForMessage(msg.id) : null;

                if (settings.inChatAvatarEnabled) {
                    const isSameSenderGroup = groupMember && lastSender === 'group_' + (groupMember ? groupMember.name : '');
                    const isSameSenderNormal = !groupMember && msg.sender === lastSender;
                    if (isSameSenderGroup || isSameSenderNormal) {
                        avatarDiv.classList.add('hidden');
                    } else if (groupMember) {
                        if (groupMember.avatar) {
                            avatarDiv.innerHTML = `<img src="${groupMember.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                        } else {
                            const initials = (groupMember.name || '?').charAt(0).toUpperCase();
                            avatarDiv.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;background:var(--accent-color);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;">${initials}</div>`;
                        }
                    } else {
                        const isUser = msg.sender === 'user';
                        const avatarElement = isUser ? DOMElements.me.avatar : DOMElements.partner.avatar;
                        const frameSettings = isUser ? settings.myAvatarFrame : settings.partnerAvatarFrame;
                        const avatarShape = isUser ? (settings.myAvatarShape || 'circle') : (settings.partnerAvatarShape || 'circle');
                        avatarDiv.innerHTML = avatarElement.innerHTML;
                        applyAvatarFrame(avatarDiv, frameSettings);
                        ['circle','square','pentagon','heart'].forEach(s => avatarDiv.classList.remove('shape-' + s));
                        if (avatarShape !== 'none') avatarDiv.classList.add('shape-' + avatarShape);
                    }
                } else {
                    avatarDiv.style.display = 'none';
                }
                wrapper.appendChild(avatarDiv);
                
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'message-content-wrapper';

                if (groupMember && groupChatSettings.showName) {
                    const nameLabel = document.createElement('div');
                    nameLabel.className = 'group-sender-name';
                    nameLabel.textContent = groupMember.name;
                    const isSameSenderGroupForName = lastSender === 'group_' + groupMember.name;
                    if (!isSameSenderGroupForName) contentWrapper.appendChild(nameLabel);
                }
                
                let messageHTML = '';
                if (msg.replyTo) {
                    const repliedText = msg.replyTo.text || (msg.replyTo.image ? '🖼 图片' : '[消息]');
                    const repliedSender = msg.replyTo.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
                    messageHTML += `<div class="reply-indicator"><span class="reply-indicator-sender">${repliedSender}</span><span class="reply-indicator-text">${repliedText}</span></div>`;
                }

                let content = msg.text ? `<div>${msg.text.replace(/\n/g, '<br>')}</div>`: '';
                if (msg.image) content += `<img src="${msg.image}" class="message-image" alt="图片" style="max-width: 200px; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="viewImage('${msg.image}')">`;
                messageHTML += content;

                if (msg.note) messageHTML += `<div class="message-note">${msg.note}</div>`;

                const messageDiv = document.createElement('div');
                messageDiv.className = `message message-${msg.sender === 'user' ? 'sent': 'received'} ${settings.bubbleStyle}`;
                messageDiv.innerHTML = messageHTML;

                let actionsHTML = '';
                
                if (settings.replyEnabled) actionsHTML += `<button class="meta-action-btn reply-btn" title="回复"><i class="fas fa-reply"></i></button>`;
                
                const starIcon = msg.favorited ? 'fas fa-star' : 'far fa-star'; 
                actionsHTML += `<button class="meta-action-btn favorite-action-btn ${msg.favorited ? 'favorited' : ''}" title="${msg.favorited ? '取消收藏' : '收藏'}"><i class="${starIcon}"></i></button>`;
                
                actionsHTML += `<button class="meta-action-btn note-btn" title="注释"><i class="fas fa-sticky-note"></i></button>`;
actionsHTML += `<button class="meta-action-btn delete-btn" title="删除"><i class="fas fa-trash-alt"></i></button>`;
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-meta-actions';
                actionsDiv.innerHTML = actionsHTML;

                let metaHTML = '';
                
                if (showTimestamp) {
                    const ts = new Date(msg.timestamp);
                    let timeStr;
                    const fmt = settings.timeFormat || 'HH:mm';
                    if (fmt === 'HH:mm:ss') {
                        timeStr = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    } else if (fmt === 'h:mm AM/PM') {
                        timeStr = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    } else if (fmt === 'h:mm:ss AM/PM') {
                        timeStr = ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
                    } else {
                        timeStr = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    }
                    metaHTML += `<div class="timestamp">${timeStr}</div>`;
                }

                if (msg.sender === 'user' && settings.readReceiptsEnabled && showTimestamp) {
                    const statusIcon = msg.status === 'read' ? 'fa-check-double': 'fa-check';
                    metaHTML += `<div class="read-receipt ${msg.status === 'read' ? 'read': ''}"><i class="fas ${statusIcon}"></i></div>`;
                }

                if (metaHTML !== '') {
                    const metaDiv = document.createElement('div');
                    metaDiv.className = 'message-meta';
                    if (!showTimestamp && !metaHTML.includes('timestamp')) {
                         metaDiv.style.height = 'auto'; 
                         metaDiv.style.marginTop = '2px';
                         if (settings.inChatAvatarPosition !== 'top') {
                             avatarDiv.style.marginBottom = '18px';
                         }
                    } else {
                         
                         if (settings.inChatAvatarPosition !== 'top') {
                             avatarDiv.style.marginBottom = '26px';
                         }
                    }
                    metaDiv.innerHTML = metaHTML;
                    contentWrapper.append(actionsDiv, messageDiv, metaDiv);
                } else {
                    contentWrapper.append(actionsDiv, messageDiv);
                }
                wrapper.appendChild(contentWrapper);
                fragment.appendChild(wrapper);
                
                lastSender = groupMember ? ('group_' + groupMember.name) : msg.sender;
            });

            container.appendChild(fragment);

            if (preserveScroll) {
                const newScrollHeight = container.scrollHeight;
                const delta = newScrollHeight - oldScrollHeight;
                container.scrollTop = Math.max(0, container.scrollTop + delta);
            } else {
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight;
                });
            }
        }        

        const addMessage = (message) => {
            if (!(message.timestamp instanceof Date)) message.timestamp = new Date(message.timestamp);
            messages.push(message);


            displayedMessageCount++;


            renderMessages(false);
            throttledSaveData();
        };

        function optimizeImage(file, maxWidth = 800, quality = 0.7) {
            return new Promise((resolve, reject) => {
                if (file.size < 300 * 1024) {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let {
                        width,
                        height
                    } = img;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                    URL.revokeObjectURL(img.src);
                };
                img.onerror = () => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                    URL.revokeObjectURL(img.src);
                };
                img.src = URL.createObjectURL(file);
            });
        }

        function sendMessage(textOverride = null, type = 'normal') {
            const text = textOverride || DOMElements.messageInput.value.trim();
            const imageFile = DOMElements.imageInput.files[0];
            if (!text && !imageFile && type === 'normal') return;

            DOMElements.messageInput.value = '';
            DOMElements.messageInput.style.height = '46px';
            if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
                showNotification('图片大小不能超过5MB', 'error'); DOMElements.imageInput.value = ''; return;
            }

            const createMessage = (imgSrc = null) => {
                const messageData = {
                    id: Date.now(),
                    sender: 'user',
                    text: text || '',
                    timestamp: new Date(),
                    image: imgSrc,
                    status: 'sent',
                    favorited: false,
                    note: null,
                    replyTo: currentReplyTo,
                    type: type
                };
                if (type === 'system') messageData.sender = null;

                addMessage(messageData);
                if (type !== 'system') playSound('send');
                currentReplyTo = null;
                updateReplyPreview();

if (!isBatchMode && type === 'normal') {
    const delayRange = settings.replyDelayMax - settings.replyDelayMin;
    const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
    
    setTimeout(() => {
        let changed = false;
        messages.forEach(msg => {
            if (msg.sender === 'user' && msg.status !== 'read') {
                msg.status = 'read'; 
                changed = true;
            }
        });
        if (changed) {
            renderMessages(false); 
            throttledSaveData();
        }

        const shouldIgnore = settings.allowReadNoReply && (Math.random() < settings.readNoReplyChance);

        if (shouldIgnore) {
            console.log("触发已读不回机制");
        } else {
            simulateReply(); 
        }

    }, randomDelay);
}
};

            if (imageFile) {
                showNotification('正在优化图片...', 'info', 1500);
                optimizeImage(imageFile).then(createMessage).catch(() => showNotification('图片处理失败', 'error'));
            } else {
                createMessage();
            }
            DOMElements.imageInput.value = '';
        }

        function toggleBatchMode() {
            isBatchMode = !isBatchMode;
            DOMElements.batchBtn.classList.toggle('active', isBatchMode);
            DOMElements.batchBtn.title = isBatchMode ? "退出批量模式": "批量发送模式";
            DOMElements.batchPreview.style.display = isBatchMode ? 'flex': 'none';
            const placeholder = "";
            DOMElements.messageInput.placeholder = isBatchMode ? "此刻，想说的有很多很多...": (placeholder.length > 20 ? placeholder.substring(0, 20) + "...": placeholder);
            if (isBatchMode) {
                batchMessages = []; updateBatchPreview();
            }
        }

        function addToBatch() {
            const text = DOMElements.messageInput.value.trim();
            if (!text) return;
            batchMessages.push({
                id: Date.now() + batchMessages.length, text
            });
            DOMElements.messageInput.value = ''; DOMElements.messageInput.style.height = '46px';
            updateBatchPreview();
        }

        function updateBatchPreview() {
            const previewContainer = DOMElements.batchPreview;
            let listHTML = '';
            if (batchMessages.length > 0) {
                listHTML = batchMessages.map((msg, index) => `
                <div class="batch-preview-item" data-index="${index}">
                <span class="batch-preview-text">${msg.text}</span>
                <button class="batch-preview-remove"><i class="fas fa-times"></i></button>
                </div>`).join('');
            } else {
                listHTML = '<div style="text-align: center; color: var(--text-secondary); font-size: 14px; padding: 10px;">つ♡⊂</div>';
            }

            previewContainer.innerHTML = `
        <div class="batch-preview-title">我有很多的话想说…！</div>
        <div class="batch-preview-list">${listHTML}</div>
        <div class="batch-actions">
        <button class="batch-action-btn batch-cancel-btn">取消</button>
        <button class="batch-action-btn batch-send-btn" ${batchMessages.length === 0 ? 'disabled': ''}>发送全部 (${batchMessages.length})</button>
        </div>`;
        }

        function sendBatchMessages() {
            if (batchMessages.length === 0) return;
            showNotification(`正在发送 ${batchMessages.length} 条消息...`, 'info', 2000);
            batchMessages.forEach((msg, index) => {
                setTimeout(() => {
                    addMessage({
                        id: Date.now() + index, sender: 'user', text: msg.text, timestamp: new Date(), status: 'sent', favorited: false, type: 'normal'
                    });
                    playSound('send');
                }, index * 300);
            });
            const delayRange = settings.replyDelayMax - settings.replyDelayMin;
            const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
            setTimeout(simulateReply, batchMessages.length * 300 + randomDelay);
            isBatchMode = false; batchMessages = [];
            DOMElements.batchBtn.classList.remove('active'); DOMElements.batchPreview.style.display = 'none';
            const placeholder = "";
            DOMElements.messageInput.placeholder = placeholder.length > 20 ? placeholder.substring(0, 20) + "...": placeholder;
        }

        function positionTypingIndicator() {
            var tiW = document.getElementById('typing-indicator-wrapper');
            var inputArea = document.querySelector('.input-area-wrapper');
            if (!tiW || !inputArea) return;
            var h = inputArea.offsetHeight;
            tiW.style.bottom = h + 'px';
        }
        (function() {
            var inputArea = document.querySelector('.input-area-wrapper');
            if (!inputArea) return;
            var ro = new ResizeObserver(function() {
                var tiW = document.getElementById('typing-indicator-wrapper');
                if (tiW && tiW.style.display !== 'none') positionTypingIndicator();
            });
            ro.observe(inputArea);
        })();

        function simulateReply() {
            // 显示正在输入指示器
            function showTypingIndicator() {
                if (!settings.typingIndicatorEnabled) return;
                const tiWrapper = document.getElementById('typing-indicator-wrapper');
                const tiLabel = document.getElementById('typing-indicator-label');
                const tiAvatar = document.getElementById('typing-indicator-avatar');
                if (tiLabel) tiLabel.textContent = (settings.partnerName || '对方') + ' 正在输入';
                if (tiWrapper) { positionTypingIndicator(); tiWrapper.style.display = 'block'; }
                if (tiAvatar) {
                    const partnerImg = DOMElements.partner.avatar.querySelector('img');
                    tiAvatar.innerHTML = partnerImg ? `<img src="${partnerImg.src}">` : '<i class="fas fa-user"></i>';
                }
                DOMElements.chatContainer.scrollTop = DOMElements.chatContainer.scrollHeight;
            }

            showTypingIndicator();

            let changed = false;
            messages.forEach(msg => {
                if (msg.sender === 'user' && msg.status !== 'read') {
                    msg.status = 'read'; changed = true;
                }
            });
            if (changed) {
                renderMessages(false); throttledSaveData();
            }

            showTypingIndicator();
if (partnerPersonas && partnerPersonas.length > 0 && Math.random() < 0.3) {
                const currentPool = [
                    ...partnerPersonas
                ];
                if(currentPool.length > 0) {
                     const nextPersona = currentPool[Math.floor(Math.random() * currentPool.length)];
                     
                     settings.partnerName = nextPersona.name;
                     DOMElements.partner.name.textContent = nextPersona.name;
                     
                     if (nextPersona.avatar) {
                         updateAvatar(DOMElements.partner.avatar, nextPersona.avatar);
                         localforage.setItem(getStorageKey('partnerAvatar'), nextPersona.avatar);
                     }
                     throttledSaveData();
                }
            }
            if (Math.random() < 0.03) {
                if (customPokes && customPokes.length > 0) {
        const randomAction = getRandomItem(customPokes);
                const pokeTypes = [{
                    prefix: "💫",
                    text: `${settings.partnerName} ${randomAction}`
                },
                    {
                        prefix: "✨",
                        text: `${settings.partnerName} ${randomAction}`
                    },
                    {
                        prefix: "🌟",
                        text: `${settings.partnerName} ${randomAction}`
                    },
                    {
                        prefix: "🥰",
                        text: `${settings.partnerName} ${randomAction}`
                    },
                    {
                        prefix: "💖",
                        text: `${settings.partnerName} ${randomAction}`
                    }];

               const selectedPoke = getRandomItem(pokeTypes);
        
        addMessage({
            id: Date.now(),
            text: `${selectedPoke.prefix} ${settings.partnerName} ${randomAction} ${selectedPoke.prefix}`,
            timestamp: new Date(),
            type: 'system'
        });
        (function(){var _tiW=document.getElementById('typing-indicator-wrapper');if(_tiW){var _tiInner=_tiW.querySelector('.typing-indicator');if(_tiInner){_tiInner.classList.add('hiding');setTimeout(function(){_tiW.style.display='none';if(_tiInner)_tiInner.classList.remove('hiding');},240);}else{_tiW.style.display='none';}}})();
        return;
    }
}

            const replyCount = Math.random() < 0.75 ? 1: (Math.random() < 0.95 ? 2: 3);
            let delay = 0;
            for (let i = 0; i < replyCount; i++) {
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                delay += settings.replyDelayMin + Math.random() * delayRange;
                setTimeout(() => {
let text = null;
let image = null;

const activeEmojis = CONSTANTS.REPLY_EMOJIS.filter(e => !disabledDefaultReplies.includes(e));
const nonTextPool = [...activeEmojis, ...stickerLibrary];

const activeDefaults = CONSTANTS.REPLY_MESSAGES.filter(msg => !disabledDefaultReplies.includes(msg));
const textPool = [...activeDefaults, ...customReplies];

if (Math.random() < 0.15 && nonTextPool.length > 0) { 
    const result = getRandomItem(nonTextPool);
    if (result.startsWith('data:image')) { 
        image = result;
    } else { 
        text = result;
    }
} else if (textPool.length > 0) {
    text = getRandomItem(textPool);
} else if (nonTextPool.length > 0) { 
     const result = getRandomItem(nonTextPool);
    if (result.startsWith('data:image')) {
        image = result;
    } else {
        text = result;
    }
} else {
    text = "（我不知道该说什么了...）";
}

let replyTo = null;
if (settings.replyEnabled && Math.random() < 0.1) {
    const userMessages = messages.filter(m => m.sender === 'user').slice(-10);
    if (userMessages.length > 0) {
        const randomMessage = getRandomItem(userMessages);
        replyTo = {
            id: randomMessage.id,
            sender: randomMessage.sender,
            text: randomMessage.text
        };
    }
}

addMessage({
    id: Date.now() + i,
    sender: 'partner',
    text: text,
    image: image, 
    timestamp: new Date(),
    favorited: false,
    replyTo,
    type: 'normal'
});
                    playSound('message');
                    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                        const notifTitle = settings.partnerName || '对方';
                        const notifBody = text ? text.slice(0, 60) : '[图片消息]';
                        try {
                            new Notification(notifTitle, {
                                body: notifBody,
                                icon: document.getElementById('partner-avatar')?.querySelector('img')?.src || undefined,
                                tag: 'new-message',
                                renotify: true
                            });
                        } catch(e) {}
                    }
                    if (i === replyCount - 1) (function(){var _tiW=document.getElementById('typing-indicator-wrapper');if(_tiW){var _tiInner=_tiW.querySelector('.typing-indicator');if(_tiInner){_tiInner.classList.add('hiding');setTimeout(function(){_tiW.style.display='none';if(_tiInner)_tiInner.classList.remove('hiding');},240);}else{_tiW.style.display='none';}}})();
                },
                    delay);
            }
        }


        function startCoinFlipAnimation() {
            const overlay = DOMElements.coinTossOverlay;
            const coin = DOMElements.animatedCoin;
            const resultText = DOMElements.coinResultText;


            overlay.classList.remove('finished');
            coin.classList.remove('flipping-heads', 'flipping-tails');


            void coin.offsetWidth;


            resultText.textContent = '命运抉择中...';


            const isHeads = Math.random() < 0.5;
            const result = isHeads ? '是': '否';
            const animationClass = isHeads ? 'flipping-heads': 'flipping-tails';


            requestAnimationFrame(() => {
                coin.classList.add(animationClass);
            });


            const onAnimationEnd = () => {

                const fancyText = isHeads ? "答案是 · 是": "答案是 · 否";
                resultText.textContent = fancyText;


                lastCoinResult = result;


                overlay.classList.add('finished');
            };


            coin.addEventListener('animationend', onAnimationEnd, {
                once: true
            });
        }


        function handleCoinToss() {
            DOMElements.coinTossOverlay.classList.add('visible');
            startCoinFlipAnimation();
        }

        function updateReplyPreview() {
            const previewContainer = DOMElements.replyPreviewContainer;
            previewContainer.innerHTML = '';

            if (currentReplyTo) {
                const preview = document.createElement('div');
                preview.className = 'reply-preview';
                const repliedText = currentReplyTo.text || (currentReplyTo.image ? '🖼 图片' : '[消息]');
                const senderName = currentReplyTo.sender === 'user' ? (settings.myName || '我') : (settings.partnerName || '对方');
                preview.innerHTML = `<div class="reply-preview-content"><span style="font-size:11px;font-weight:600;color:var(--accent-color);display:block;margin-bottom:2px;">回复 ${senderName}</span><span>${repliedText}</span></div><button class="reply-preview-remove"><i class="fas fa-times"></i></button>`;
                preview.querySelector('.reply-preview-remove').addEventListener('click', () => {
                    currentReplyTo = null; updateReplyPreview();
                });
                previewContainer.appendChild(preview);
            }
        }


        function renderFavorites() {
            const list = DOMElements.favoritesModal.list;

            const favoritedMessages = messages.filter(m => m.favorited).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (favoritedMessages.length === 0) {
                list.innerHTML = `
            <div class="no-favorites">
            <i class="fas fa-folder-open"></i>
            <p>星球的角落空空如也...</p>
            <span style="font-size:12px; margin-top:5px; opacity:0.7">点击消息旁的星星即可收藏</span>
            </div>`;
                return;
            }

            list.innerHTML = favoritedMessages.map(msg => {

                const isMe = msg.sender === 'user';

                const avatarSrc = isMe
                ? (document.getElementById('my-avatar').querySelector('img')?.src || ''): (document.getElementById('partner-avatar').querySelector('img')?.src || '');

                const avatarHTML = avatarSrc
                ? `<img src="${avatarSrc}" class="fav-avatar" alt="avatar">`: `<div class="fav-avatar"><i class="fas fa-user"></i></div>`;

                const name = isMe ? settings.myName: settings.partnerName;


                let contentHTML = msg.text ? `<span>${msg.text.replace(/\n/g, '<br>')}</span>`: '';
                if (msg.image) contentHTML += `<img src="${msg.image}" alt="图片" loading="lazy">`;


                const timeStr = new Date(msg.timestamp).toLocaleString('zh-CN', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return `
            <div class="fav-card" id="fav-card-${msg.id}">
            ${avatarHTML}
            <div class="fav-content-wrapper">
            <div class="fav-header">
            <span class="fav-sender-name">${name}</span>
            <span style="opacity:0.6">${timeStr}</span>
            </div>
            <div class="fav-bubble">
            ${contentHTML}
            </div>
            <button class="fav-action-btn" onclick="removeFavorite(${msg.id})">
            <i class="fas fa-trash-alt"></i> 移除
            </button>
            </div>
            </div>`;
            }).join('');
        }


        window.removeFavorite = function(msgId) {
            const message = messages.find(m => m.id === msgId);
            if (message) {
                message.favorited = false;

                const card = document.getElementById(`fav-card-${msgId}`);
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        renderFavorites();
                        throttledSaveData();
                        const chatMsgBtn = document.querySelector(`.message-wrapper[data-id="${msgId}"] .favorite-meta-btn`);
                        if (chatMsgBtn) chatMsgBtn.classList.remove('favorited');
                    },
                        300);
                }
            }
        };

function showModal(modalElement, focusElement = null) {
            if (modalElement._hideTimeout) {
                clearTimeout(modalElement._hideTimeout);
                modalElement._hideTimeout = null;
            }
            modalElement.style.display = 'flex';
            requestAnimationFrame(() => {
                const content = modalElement.querySelector('.modal-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0) scale(1)';
                }
                if (focusElement) {
                    setTimeout(() => focusElement.focus(), 100);
                }
            });
        }

        function hideModal(modalElement) {
            const content = modalElement.querySelector('.modal-content');
            if (content) {
                content.style.opacity = '0';
                content.style.transform = 'translateY(20px) scale(0.95)';
            }
            if (modalElement._hideTimeout) clearTimeout(modalElement._hideTimeout);
            modalElement._hideTimeout = setTimeout(() => {
                modalElement.style.display = 'none';
            }, 300);
        }

        function viewImage(src) {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;touch-action:pinch-zoom;';
            modal.innerHTML = `
                <div style="position:relative;max-width:95vw;max-height:92vh;display:flex;align-items:center;justify-content:center;">
                    <img src="${src}" style="max-width:95vw;max-height:88vh;object-fit:contain;display:block;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.6);" draggable="false">
                    <button onclick="this.closest('[style*=fixed]').remove()" style="position:fixed;top:16px;right:16px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);z-index:10;line-height:1;">×</button>
                    <a href="${src}" download style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 24px;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.3);border-radius:20px;color:#fff;font-size:13px;text-decoration:none;backdrop-filter:blur(8px);display:flex;align-items:center;gap:6px;"><i class="fas fa-download"></i> 保存图片</a>
                </div>`;
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.tagName === 'IMG') modal.remove();
            });
            document.body.appendChild(modal);
        }

        function exportChatHistory() {
            try {
                let dgCustomData = null, dgStatusPool = null, customWeatherMap = {};
                try { dgCustomData = JSON.parse(localStorage.getItem('dg_custom_data') || 'null'); } catch(e2) {}
                try { dgStatusPool = JSON.parse(localStorage.getItem('dg_status_pool') || 'null'); } catch(e2) {}
                for (var ki = 0; ki < localStorage.length; ki++) {
                    var kk = localStorage.key(ki);
                    if (kk && kk.startsWith('customWeather_')) customWeatherMap[kk] = localStorage.getItem(kk);
                }
                const dataStr = JSON.stringify({
                    version: "3.0",
                    exportDate: new Date().toISOString(),
                    messages,
                    settings,
                    customReplies,
                    anniversaries,
                    customThemes,
                    stickerLibrary,
                    dgCustomData,
                    dgStatusPool,
                    customWeatherMap
                },
                    null,
                    2);


                if (navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {

                    const blob = new Blob([dataStr], {
                        type: 'application/json;charset=utf-8'
                    });
                    const file = new File([blob], `chat-backup-${SESSION_ID}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`, {
                        type: 'application/json'
                    });

                    if (navigator.canShare && navigator.canShare({
                        files: [file]
                    })) {
                        navigator.share({
                            files: [file],
                            title: '聊天记录备份',
                            text: `聊天记录备份 - ${new Date().toLocaleDateString()}`
                        }).then(() => {
                            showNotification('分享成功', 'success');
                        }).catch((error) => {
                            console.error('分享失败:', error);
                            fallbackExport(dataStr);
                        });
                    } else {
                        fallbackExport(dataStr);
                    }
                } else {

                    fallbackExport(dataStr);
                }
            } catch (error) {
                console.error('导出失败:', error);
                showNotification('导出失败，请重试', 'error');
            }
        }

        function fallbackExport(dataStr) {
            const dataBlob = new Blob([dataStr], {
                type: 'application/json;charset=utf-8'
            });
            const url = URL.createObjectURL(dataBlob);


            const link = document.createElement('a');
            link.href = url;
            link.download = `chat-backup-${SESSION_ID}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);


            setTimeout(() => URL.revokeObjectURL(url), 100);
            showNotification(`成功导出 ${messages.length} 条消息`, 'success');
        }

        function importChatHistory(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (!importedData.messages || !Array.isArray(importedData.messages)) throw new Error('无效的聊天记录文件');
                    if (messages.length > 0 && !confirm('导入将覆盖当前会话的聊天记录，确定继续吗？')) return;

                    messages = importedData.messages.map(m => ({
                        ...m, timestamp: new Date(m.timestamp)
                    }));
                    if (importedData.settings) Object.assign(settings, importedData.settings);
                    if (importedData.customReplies) customReplies = importedData.customReplies;
                    if (importedData.anniversaries) anniversaries = importedData.anniversaries;
                    if(importedData.customThemes) customThemes = importedData.customThemes;
                    if(importedData.stickerLibrary) stickerLibrary = importedData.stickerLibrary;
                    if(importedData.dgCustomData) { try { localStorage.setItem('dg_custom_data', JSON.stringify(importedData.dgCustomData)); } catch(e2) {} }
                    if(importedData.dgStatusPool) { try { localStorage.setItem('dg_status_pool', JSON.stringify(importedData.dgStatusPool)); } catch(e2) {} }
                    if(importedData.customWeatherMap) { try { for(var wk in importedData.customWeatherMap) localStorage.setItem(wk, importedData.customWeatherMap[wk]); } catch(e2) {} }

                    saveData();
                    updateUI();
                    showNotification(`成功导入 ${messages.length} 条消息`, 'success');
                } catch (error) {
                    console.error('导入失败:', error);
                    showNotification('文件格式错误或已损坏', 'error');
                }
            };
            reader.onerror = () => showNotification('文件读取失败', 'error');
            reader.readAsText(file);
        }

        const checkStatusChange = () => {
            if ((Date.now() - settings.lastStatusChange) / 36e5 >= settings.nextStatusChange) {
if (customStatuses && customStatuses.length > 0) {
    settings.partnerStatus = getRandomItem(customStatuses);
}
                settings.lastStatusChange = Date.now();
                settings.nextStatusChange = 1 + Math.random() * 7;
                DOMElements.partner.status.textContent = settings.partnerStatus;
                throttledSaveData();
            }
        };


function renderStatsContent() {
            const statsContent = DOMElements.statsModal.content;

            const partnerMessages = messages.filter(msg =>
                msg.sender === 'partner' &&
                msg.text &&
                msg.type !== 'system'
            );
            
            const myMessages = messages.filter(msg =>
                msg.sender === 'user' &&
                msg.text &&
                msg.type !== 'system'
            );

            if (partnerMessages.length === 0 && myMessages.length === 0) {
                statsContent.innerHTML = `
                    <div class="stats-empty-state">
                        <div class="stats-empty-icon"><i class="fas fa-chart-pie"></i></div>
                        <h3>暂无数据</h3>
                        <p>多聊几句再来看看吧...</p>
                    </div>`;
                return;
            }

            const getTopReplies = (msgs) => {
                const countMap = {};
                msgs.forEach(msg => {
                    const text = msg.text.trim();
                    if (text) {
                        countMap[text] = (countMap[text] || 0) + 1;
                    }
                });
                return Object.entries(countMap)
                    .map(([text, count]) => ({ text, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5); 
            };

            const partnerTop = getTopReplies(partnerMessages);
            const myTop = getTopReplies(myMessages);

            const generateRankHTML = (list) => {
                if (list.length === 0) return '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
                const maxVal = list[0].count;
                return list.map((item, index) => {
                    const percent = (item.count / maxVal) * 100;
                    return `
                    <div class="rank-item">
                        <div class="rank-progress-bg" style="width: ${percent}%; opacity: 0.1; background-color: var(--text-primary);"></div>
                        <div class="rank-info">
                            <div class="rank-number">#${index + 1}</div>
                            <div class="rank-text" title="${item.text}">${item.text}</div>
                            <div class="rank-count">${item.count}次</div>
                        </div>
                    </div>`;
                }).join('');
            };

            const allMsgs = messages.filter(m => m.timestamp);
            const firstMsg = allMsgs.length > 0 ? allMsgs[0] : { timestamp: new Date() };
            const lastMsg = allMsgs.length > 0 ? allMsgs[allMsgs.length - 1] : { timestamp: new Date() };

            const formatDate = (dateObj) => {
                return new Date(dateObj).toLocaleDateString('zh-CN', {
                    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                });
            };

            statsContent.innerHTML = `
                <div class="stats-dashboard">
                    <div class="stats-overview-grid">
                        <div class="overview-item">
                            <div class="overview-value">${messages.length}</div>
                            <div class="overview-label">总消息数</div>
                        </div>
                        <div class="overview-item">
                            <div class="overview-value">${myMessages.length}</div>
                            <div class="overview-label">我发送的</div>
                        </div>
                        <div class="overview-item">
                            <div class="overview-value">${formatDate(firstMsg.timestamp)}</div>
                            <div class="overview-label">初次相遇</div>
                        </div>
                        <div class="overview-item">
                            <div class="overview-value">${formatDate(lastMsg.timestamp)}</div>
                            <div class="overview-label">最近联络</div>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <button id="stats-toggle-partner" class="stats-toggle-btn active" onclick="switchStatsView('partner')">
                                <i class="fas fa-user-circle"></i> 对方
                            </button>
                            <button id="stats-toggle-me" class="stats-toggle-btn" onclick="switchStatsView('me')">
                                <i class="fas fa-user"></i> 我方
                            </button>
                        </div>
                        <div class="stats-card-title" id="stats-rank-title">
                            <i class="fas fa-user-circle"></i> 对方高频词 TOP 5
                        </div>
                        <div class="stats-rank-list" id="stats-rank-list">
                            ${generateRankHTML(partnerTop)}
                        </div>
                    </div>
                </div>
            `;

            statsContent._partnerHTML = generateRankHTML(partnerTop);
            statsContent._myHTML = generateRankHTML(myTop);
        }

        window.switchStatsView = function(who) {
            const statsContent = DOMElements.statsModal.content;
            const partnerBtn = document.getElementById('stats-toggle-partner');
            const meBtn = document.getElementById('stats-toggle-me');
            const title = document.getElementById('stats-rank-title');
            const list = document.getElementById('stats-rank-list');
            if (!partnerBtn || !meBtn || !list) return;

            if (who === 'partner') {
                partnerBtn.classList.add('active');
                meBtn.classList.remove('active');
                title.innerHTML = '<i class="fas fa-user-circle"></i> 对方高频词 TOP 5';
                list.innerHTML = statsContent._partnerHTML || '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
            } else {
                meBtn.classList.add('active');
                partnerBtn.classList.remove('active');
                title.innerHTML = '<i class="fas fa-user"></i> 我方高频词 TOP 5';
                list.innerHTML = statsContent._myHTML || '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
            }
        };
        function renderSessionList() {
            const listContainer = DOMElements.sessionModal.list;
            if (sessionList.length === 0) {
                listContainer.innerHTML = '<div class="stats-empty" style="padding: 20px 0;"><p>还没有会话</p></div>';
                return;
            }
            listContainer.innerHTML = sessionList.map(session => `
            <div class="session-item ${session.id === SESSION_ID ? 'active': ''}" data-id="${session.id}">
            <div class="session-info">
            <div class="session-name">${session.name}</div>
            <div class="session-meta">创建于 ${new Date(session.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="session-actions">
            <button class="session-action-btn rename" title="重命名"><i class="fas fa-pen"></i></button>
            <button class="session-action-btn delete" title="删除"><i class="fas fa-trash"></i></button>
            </div>
            </div>
            `).join('');
        }


async function generateFortune() {
    const todayKey = new Date().toDateString();
    const storageKey = `${APP_PREFIX}daily_fortune`;
    let fortuneData = null;

    try {
        const savedData = await localforage.getItem(storageKey);
        if (savedData && savedData.date === todayKey) {
            fortuneData = savedData;
        }
    } catch (e) { console.warn("读取运势失败", e); }

    if (!fortuneData) {
        const cards = CONSTANTS.TAROT_CARDS;
        const randomIndex = Math.floor(Math.random() * cards.length);
        const isUpright = Math.random() > 0.5;

        fortuneData = {
            date: todayKey,
            cardIndex: randomIndex,
            isUpright: isUpright
        };
        await localforage.setItem(storageKey, fortuneData);
    }

    renderFortuneCardInteractive(fortuneData);
}

function renderFortuneCardInteractive(data) {
    const content = document.getElementById('fortune-content');
    
    if (!content) return showNotification('组件加载失败，请刷新页面', 'error');

    const card = CONSTANTS.TAROT_CARDS[data.cardIndex];
    const isUpright = data.isUpright;

    content.innerHTML = `
        <div style="text-align:center; margin-bottom:10px; color:var(--text-secondary); font-size:12px;">
            <i class="fas fa-hand-pointer"></i> 点击卡牌揭晓今日指引
        </div>
        
        <div class="tarot-container-3d" onclick="this.classList.toggle('flipped'); document.getElementById('fortune-text-area').classList.add('visible');">
            <div class="tarot-card-inner">
                <div class="tarot-face tarot-front">
                    <div class="tarot-pattern"><i class="fas fa-star-and-crescent"></i></div>
                    <div style="margin-top:10px; font-size:12px; letter-spacing:2px;">THE FATE</div>
                </div>

                <div class="tarot-face tarot-back">
                    <div class="tarot-visual ${isUpright ? '' : 'reversed'}" style="height:100px;">
                        <i class="fas ${card.icon} tarot-icon-vector" style="font-size:48px;"></i>
                    </div>
                    <div>
                        <div class="tarot-card-name" style="font-size:18px;">${card.name}</div>
                        <div class="tarot-position-badge ${isUpright ? 'upright' : 'reversed'}" style="margin:5px 0;">
                            ${isUpright ? "正位" : "逆位"}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="fortune-text-area" class="fortune-result-area">
            <div class="tarot-keyword" style="font-size:16px; margin-bottom:8px;">「${card.keyword}」</div>
            <div class="fortune-desc" style="font-size:14px; margin-bottom:10px;">${card.meaning}</div>
            <div class="fortune-tip" style="font-size:12px; border-top:1px dashed var(--border-color); padding-top:8px;">
                💡 指引：${isUpright ? "顺势而为，保持当下的能量。" : "换个角度思考，也许是转机。"}
            </div>
        </div>
    `;

    showModal(document.getElementById('fortune-lenormand-modal'));
}

let lenormandSystem = 36;
let lenormandCount = 1;

const LENORMAND_CARDS_40 = [
    { num: 1, name: "骑士", icon: "🏇", keyword: "消息·速度", meaning: "快速到来的消息，行动迅速，使者，短途旅行。" },
    { num: 2, name: "四叶草", icon: "🍀", keyword: "幸运·机遇", meaning: "小幸运，偶然的好运，短暂的喜悦，乐观面对生活。" },
    { num: 3, name: "帆船", icon: "⛵", keyword: "旅行·方向", meaning: "旅行，冒险，追寻目标，人生的航向。" },
    { num: 4, name: "房屋", icon: "🏠", keyword: "家庭·安稳", meaning: "家，稳定，安全感，家庭关系，房产。" },
    { num: 5, name: "大树", icon: "🌳", keyword: "健康·根基", meaning: "健康，生命力，成长，根基，长久稳固。" },
    { num: 6, name: "乌云", icon: "☁️", keyword: "困惑·障碍", meaning: "困惑，不确定，暂时的阴霾，需要耐心等待。" },
    { num: 7, name: "蛇", icon: "🐍", keyword: "诱惑·迂回", meaning: "竞争者，诱惑，迂回的道路，复杂的女性。" },
    { num: 8, name: "棺材", icon: "⚰️", keyword: "结束·转变", meaning: "结束，转变，某事告一段落，低落期，疾病。" },
    { num: 9, name: "花束", icon: "💐", keyword: "礼物·喜悦", meaning: "礼物，惊喜，喜悦，美好的关系，感激之情。" },
    { num: 10, name: "镰刀", icon: "🌾", keyword: "决断·收割", meaning: "突然的决定，危险，收割，结束，手术。" },
    { num: 11, name: "鞭子", icon: "⚡", keyword: "争执·激情", meaning: "争论，冲突，重复，激情，体育运动。" },
    { num: 12, name: "鸟儿", icon: "🐦", keyword: "对话·焦虑", meaning: "对话，流言，消息，焦虑，一对情侣。" },
    { num: 13, name: "孩童", icon: "🧒", keyword: "新开始·纯真", meaning: "新的开始，纯真，孩子，小事，新鲜感。" },
    { num: 14, name: "狐狸", icon: "🦊", keyword: "狡猾·工作", meaning: "狡猾，策略，工作，谨防欺骗，自我保护。" },
    { num: 15, name: "熊", icon: "🐻", keyword: "力量·权威", meaning: "强大的力量，老板，财务，母性，保护者。" },
    { num: 16, name: "星星", icon: "⭐", keyword: "希望·指引", meaning: "希望，梦想，灵感，指引，清晰，美好未来。" },
    { num: 17, name: "鹳鸟", icon: "🕊️", keyword: "变化·移动", meaning: "变化，移动，适应，新的生活阶段，迁徙。" },
    { num: 18, name: "狗", icon: "🐕", keyword: "友谊·忠诚", meaning: "忠诚的朋友，友谊，可靠，支持，宠物。" },
    { num: 19, name: "高塔", icon: "🏰", keyword: "孤独·机构", meaning: "孤独，边界，机构，官方，距离，自我保护。" },
    { num: 20, name: "花园", icon: "🌺", keyword: "社交·公众", meaning: "社交场合，公众，聚会，开放的空间。" },
    { num: 21, name: "山丘", icon: "⛰️", keyword: "障碍·挑战", meaning: "障碍，挑战，延迟，竞争，需要攀越的困难。" },
    { num: 22, name: "十字路口", icon: "🛤️", keyword: "选择·方向", meaning: "选择，岔路，可能性，多条道路，决策时刻。" },
    { num: 23, name: "老鼠", icon: "🐀", keyword: "损耗·压力", meaning: "损失，压力，焦虑，偷走，逐渐减少，担忧。" },
    { num: 24, name: "心", icon: "❤️", keyword: "爱情·感情", meaning: "爱，感情，关怀，真心，情感的核心。" },
    { num: 25, name: "指环", icon: "💍", keyword: "承诺·契约", meaning: "承诺，契约，婚姻，合作，循环往复。" },
    { num: 26, name: "书", icon: "📚", keyword: "秘密·知识", meaning: "秘密，知识，学习，隐藏的信息，需要深入了解。" },
    { num: 27, name: "信件", icon: "✉️", keyword: "沟通·文件", meaning: "通讯，文件，信息，书面合同，重要的消息。" },
    { num: 28, name: "男士", icon: "👨", keyword: "男性·当事人", meaning: "主要男性人物，男性提问者或重要男性。" },
    { num: 29, name: "女士", icon: "👩", keyword: "女性·当事人", meaning: "主要女性人物，女性提问者或重要女性。" },
    { num: 30, name: "百合", icon: "🌸", keyword: "纯洁·平静", meaning: "纯洁，平静，和谐，成熟的感情，高尚的品格。" },
    { num: 31, name: "太阳", icon: "☀️", keyword: "成功·活力", meaning: "成功，活力，快乐，温暖，光明，积极能量。" },
    { num: 32, name: "月亮", icon: "🌙", keyword: "荣誉·直觉", meaning: "荣誉，名声，直觉，情感波动，创造力，梦境。" },
    { num: 33, name: "钥匙", icon: "🔑", keyword: "答案·解锁", meaning: "答案，解决方案，重要发现，开启新的可能。" },
    { num: 34, name: "鱼", icon: "🐟", keyword: "财富·流动", meaning: "财富，生意，流动，丰盛，商业活动，资源。" },
    { num: 35, name: "锚", icon: "⚓", keyword: "稳定·坚持", meaning: "稳定，坚持，目标，长期，踏实，工作。" },
    { num: 36, name: "十字架", icon: "✝️", keyword: "命运·担当", meaning: "命运，责任，痛苦，信仰，接受，精神使命。" },
    { num: 37, name: "灵体", icon: "💭", keyword: "高我·感受", meaning: "直觉，感受，觉察，因果规律，灵魂伴侣，。" },
    { num: 38, name: "香炉", icon: "⚖️", keyword: "清除·归零", meaning: "清除，净化，消散，弥漫，清净之地，氛围感。" },
    { num: 39, name: "床", icon: "🛏", keyword: "舒适·休息", meaning: "睡觉，回避，躺平，舒适，卧室，性关系。" },
    { num: 40, name: "市场", icon: "🏪", keyword: "交易·工作", meaning: "工作，交易，维护，运营，势均力敌，出去游玩。" }
];

function getLenormandCards() {
    return LENORMAND_CARDS_40.slice(0, lenormandSystem);
}

function setLenormandSystem(n) {
    lenormandSystem = n;
}

function setLenormandCount(n) {
    lenormandCount = n;
    document.querySelectorAll('.lenormand-num-btn').forEach(btn => {
        const numEl = btn.querySelector('.leno-btn-num');
        btn.classList.toggle('active', numEl && parseInt(numEl.textContent) === n);
    });
    updateLenoNumDesc(n);
}

function updateLenoNumDesc(n) {
    const desc = document.getElementById('leno-num-desc');
    if (!desc) return;
    if (n === 1) desc.textContent = '单张牌 · 直达答案';
    else if (n === 3) desc.textContent = '三张牌 · 过去 · 现在 · 未来';
}

function switchFLTab(tab) {
    document.querySelectorAll('.fl-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.fl-panel').forEach(panel => panel.classList.remove('fl-panel-active'));
    const activeTab = document.getElementById('fl-tab-' + tab);
    const activePanel = document.getElementById('fl-panel-' + tab);
    if (activeTab) activeTab.classList.add('active');
    if (activePanel) activePanel.classList.add('fl-panel-active');
}

function openLenormandModal() {
    resetLenormand();
    switchFLTab('lenormand');
    showModal(document.getElementById('fortune-lenormand-modal'));
}

function resetLenormand() {
    const setup = document.getElementById('lenormand-setup');
    const result = document.getElementById('lenormand-result');
    const resetBtn = document.getElementById('lenormand-reset-btn');
    const qInput = document.getElementById('lenormand-question');
    if (setup) setup.style.display = '';
    if (result) result.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (qInput) qInput.value = '';
    lenormandSystem = 40;
    lenormandCount = 1;
    document.querySelectorAll('.lenormand-num-btn').forEach(btn => {
        const num = btn.querySelector('.leno-btn-num');
        btn.classList.toggle('active', num && num.textContent.trim() === '1');
    });
    updateLenoNumDesc(1);
}

function startLenormandDraw() {
    const cards = getLenormandCards();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, lenormandCount);
    const question = document.getElementById('lenormand-question').value.trim();

    let cardsHTML = drawn.map((card, i) => `
        <div class="lenormand-card-item" style="animation-delay:${i * 0.1}s;">
            <span class="lenormand-card-icon">${card.icon}</span>
            <div class="lenormand-card-name">${card.name}</div>
            <div class="lenormand-card-num">No.${card.num}</div>
            <div class="lenormand-card-keyword">「${card.keyword}」</div>
            <div class="lenormand-card-meaning">${card.meaning}</div>
        </div>
    `).join('');

    let synthesisHTML = '';
    if (drawn.length > 1) {
        const keywords = drawn.map(c => c.keyword.split('·')[0]).join('、');
        const energies = drawn.map(c => c.name).join(' + ');
        const m0 = drawn[0].meaning.split('，')[0];
        const m2 = drawn.length >= 3 ? drawn[2].meaning.split('，')[0] : '';
        const n0 = drawn[0].name, n1 = drawn[1].name, n2 = drawn.length >= 3 ? drawn[2].name : '';
        
        const templates3 = [
            `「${n0}」带来的过去，如同${m0}的底色；「${n1}」描绘当下正在发生的一切；「${n2}」则指向${m2}的未来轮廓。三张牌的能量流动，共同编织出一段关于${keywords}的故事。`,
            `星盘之上，「${n0}」、「${n1}」、「${n2}」三张牌依次展开——过去的印记、当下的选择、未来的可能，皆在这三枚符号里悄悄低语。${keywords}，是此刻需要关注的核心能量。`,
            `从「${n0}」到「${n2}」，时间在牌阵中流动。${m0}的过去造就了你现在的模样，而${m2}的方向，正等待你迈出那一步。愿此刻的「${n1}」，成为连接两端的桥梁。`,
            `三张牌共同呈现了一段旅程：以「${n0}」为起点，经历「${n1}」的当下时刻，抵达「${n2}」所指引的远方。${keywords}的主题贯穿其中，指引着前行的方向。`,
            `宇宙借${energies}的能量，向你传递信息：曾经${m0}，如今正经历转变，而前方${m2}的可能性已悄然开启。请相信这段旅程有其深意。`
        ];
        const templates2 = [
            `「${n0}」与「${n1}」的能量相遇，${keywords}的主题在此交汇。${m0}的力量遇见了新的可能，共同描绘出当下局势的面貌。`,
            `两张牌携手而来：「${n0}」带着${m0}的底色，「${n1}」带来新的视角。它们共同指向一个关于${keywords}的答案，等待你细细品味。`,
            `${energies}——两种能量在你的问题上留下印记。${m0}与对方的能量相互作用，当前局面因此充满了${keywords}的质感。静下心来，答案已在其中。`,
            `牌与牌之间总有呼应。「${n0}」和「${n1}」的组合，像是宇宙特意为你排列的密码，${keywords}便是解读这段缘分的钥匙。`
        ];
        
        const templates = drawn.length === 3 ? templates3 : templates2;
        const chosenText = templates[Math.floor(Math.random() * templates.length)];
        
        synthesisHTML = `
        <div class="lenormand-synthesis">
            <div class="lenormand-synthesis-title">✦ 综合解读</div>
            ${chosenText}
        </div>`;
    }

    const questionDisplay = question ? `<div class="lenormand-question-show">「${question}」</div>` : '';

    document.getElementById('lenormand-result').innerHTML = `
        ${questionDisplay}
        <div style="text-align:center; font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            <i class="fas fa-moon"></i> 雷诺曼轻声说 · 爱能克服远距离
        </div>
        <div class="lenormand-cards-row">${cardsHTML}</div>
        ${synthesisHTML}
    `;

    document.getElementById('lenormand-setup').style.display = 'none';
    document.getElementById('lenormand-result').style.display = '';
    document.getElementById('lenormand-reset-btn').style.display = '';
}

function toggleBatchFavoriteMode() {
            isBatchFavoriteMode = !isBatchFavoriteMode;
            selectedMessages = [];

            if (isBatchFavoriteMode) {
                document.body.classList.add('batch-favorite-mode');
                showBatchFavoriteActions();
                showNotification('批量收藏模式已开启，点击消息进行选择', 'info');
            } else {
                document.body.classList.remove('batch-favorite-mode');
                hideBatchFavoriteActions();
                showNotification('批量收藏模式已关闭', 'info');
            }

            renderMessages(true);
        }

        function hideBatchFavoriteActions() {
            const actions = document.querySelector('.batch-favorite-actions');
            if (actions) {

                actions.style.animation = 'floatUpAction 0.3s reverse forwards';
                setTimeout(() => {
                    actions.remove();
                }, 300);
            }
        }


        function showBatchFavoriteActions() {

            if (document.querySelector('.batch-favorite-actions')) return;

            const actions = document.createElement('div');
            actions.className = 'batch-favorite-actions';

            actions.innerHTML = `
        <button class="batch-action-btn-pill batch-btn-cancel" id="cancel-batch-favorite">
        <i class="fas fa-times"></i> 取消
        </button>
        <button class="batch-action-btn-pill batch-btn-confirm" id="confirm-batch-favorite">
        <i class="fas fa-check"></i> 确认收藏 (0)
        </button>
        `;
            document.body.appendChild(actions);

            document.getElementById('confirm-batch-favorite').addEventListener('click', confirmBatchFavorite);
            document.getElementById('cancel-batch-favorite').addEventListener('click', toggleBatchFavoriteMode);
        }


        function confirmBatchFavorite() {
            if (selectedMessages.length === 0) {
                showNotification('请先选择要收藏的消息', 'warning');
                return;
            }


            const count = selectedMessages.length;


            selectedMessages.forEach(msgId => {
                const message = messages.find(m => m.id === msgId);
                if (message) {
                    message.favorited = true;
                }
            });


            throttledSaveData();


            toggleBatchFavoriteMode();


            showNotification(`已成功收藏 ${count} 条消息`, 'success');
        }



        function renderAnniversaries() {
    const list = DOMElements.anniversaryModal.list;
    if (anniversaries.length === 0) {
        list.innerHTML = '<div class="no-favorites" style="padding:20px 0;"><i class="fas fa-heart" style="font-size:24px;margin-bottom:10px;"></i><p>还没有记录纪念日</p></div>';
        return;
    }

    list.innerHTML = anniversaries.map(anniversary => {
        const startDate = new Date(anniversary.date);
        const now = new Date();
        let diffDays;
        
        if (anniversary.type === 'countdown') {
            diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0; 
        } else {
            diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        }

        const typeClass = anniversary.type === 'countdown' ? 'type-future' : 'type-past';
        const tagText = anniversary.type === 'countdown' ? '倒数' : '纪念';

        return `
        <div class="anniversary-card ${typeClass}" data-id="${anniversary.id}">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <div class="ann-info">
                    <div class="ann-name">
                        ${anniversary.name} 
                        <span class="ann-tag">${tagText}</span>
                    </div>
                    <div class="ann-date">${startDate.toLocaleDateString()}</div>
                </div>
                <div class="ann-days">
                    <span class="ann-number">${diffDays}</span>
                    <span class="ann-label">Days</span>
                </div>
            </div>
            <div class="ann-delete-btn" style="position:absolute; top:-8px; right:-8px; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity 0.2s;" 
                 onclick="deleteAnniversary(${anniversary.id}, event)">
                <i class="fas fa-times" style="font-size:12px;"></i>
            </div>
        </div>
        `;
    }).join('');
}

        function addAnniversary() {
    const nameInput = document.getElementById('ann-input-name');
    const dateInput = document.getElementById('ann-input-date');
    
    const name = (nameInput ? nameInput.value : (DOMElements.anniversaryModal.nameInput ? DOMElements.anniversaryModal.nameInput.value : '')).trim();
    const date = dateInput ? dateInput.value : (DOMElements.anniversaryModal.dateInput ? DOMElements.anniversaryModal.dateInput.value : '');

    if (!name || !date) {
        showNotification('请填写名称和日期', 'error');
        return;
    }

    const type = (typeof currentAnnType !== 'undefined' ? currentAnnType : null) 
              || (typeof currentAnniversaryType !== 'undefined' ? currentAnniversaryType : 'anniversary');

    const newAnniversary = {
        id: Date.now(),
        name: name,
        date: date,
        type: type
    };

    anniversaries.push(newAnniversary);
    throttledSaveData();
    renderAnniversariesList();
    
    if (nameInput) nameInput.value = '';
    if (dateInput) dateInput.value = '';
    if (DOMElements.anniversaryModal.nameInput) DOMElements.anniversaryModal.nameInput.value = '';
    if (DOMElements.anniversaryModal.dateInput) DOMElements.anniversaryModal.dateInput.value = '';

    const annFormWrapper = document.getElementById('ann-form-wrapper');
    const annToggleBtn = document.getElementById('ann-toggle-btn');
    if (annFormWrapper) annFormWrapper.classList.remove('active');
    if (annToggleBtn) annToggleBtn.classList.remove('active');

    showNotification('纪念日已添加', 'success');
}

        function showAnniversaryAnimation(anniversary) {
            const startDate = new Date(anniversary.date);
            const now = new Date();
            let diffDays;
            let title, message;

            if (anniversary.type === 'countdown') {

                diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                title = "倒数日";
                message = `距离 ${anniversary.name} 还有`;
            } else {

                diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                title = "纪念日快乐！";
                message = `我们已经相伴了`;
            }

            DOMElements.anniversaryAnimation.title.textContent = title;
            DOMElements.anniversaryAnimation.days.textContent = diffDays;
            DOMElements.anniversaryAnimation.message.textContent = message;

            DOMElements.anniversaryAnimation.modal.classList.add('active');
        }

        function updateAnniversaryDisplay(dateString) {
            if (!dateString) return;

            const start = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            DOMElements.anniversaryModal.daysElement.textContent = diffDays;
            DOMElements.anniversaryModal.dateShowElement.textContent = `起始日：${start.toLocaleDateString()}`;
            DOMElements.anniversaryModal.displayArea.style.display = 'block';
        }


const MOOD_OPTIONS = [
    { key: 'happy', kaomoji: '😆', label: '开心', color: '#FFD93D' },
    { key: 'excited', kaomoji: '🥰', label: '兴奋', color: '#FF6B6B' },
    { key: 'peace', kaomoji: '☺️', label: '平淡', color: '#6BCB77' },
    { key: 'sad', kaomoji: '😕', label: '难过', color: '#4D96FF' },
    { key: 'tired', kaomoji: '😞', label: '疲惫', color: '#8D9EFF' },
    { key: 'angry', kaomoji: '😠', label: '生气', color: '#FF4757' },
    { key: 'love', kaomoji: '🥰', label: '想你', color: '#FF9A8B' },
    { key: 'busy', kaomoji: '😵‍💫', label: '忙碌', color: '#A8D8EA' },
    { key: 'sleepy', kaomoji: '😴', label: '困困', color: '#E0C3FC' },
{ key: 'lonely', kaomoji: '🥹', label: '孤单', color: '#B8A9C9' }, 
{ key: 'cool', kaomoji: '😎', label: '潇洒', color: '#2C3E50' },
    { key: 'cute', kaomoji: '🥺', label: '撒娇', color: '#FFB6C1' }
];

let moodData = {}; 
let currentCalendarDate = new Date();
window.selectedDateStr = null;
let selectedDateStr = null;
let currentMoodPage = 1; 
let currentMoodEditTarget = 'me'; 
let customMoodOptions = []; 
let customMoodSelectedColor = '#FFD93D';
const CUSTOM_MOOD_COLORS = ['#FFD93D','#FF6B6B','#6BCB77','#4D96FF','#8D9EFF','#FF9A8B','#A8D8EA','#E0C3FC','#B8A9C9','#2C3E50'];

async function initMoodData() {
    const savedMoods = await localforage.getItem(getStorageKey('moodCalendar'));
    if (savedMoods) { moodData = savedMoods; }
    const savedCustomMoods = await localforage.getItem(getStorageKey('customMoodOptions'));
    if (savedCustomMoods) { customMoodOptions = savedCustomMoods; }
    window.moodData = moodData;
    checkPartnerDailyMood();
}
function checkPartnerDailyMood() {
    const today = new Date();
    const dateStr = formatDateStr(today);
    
    if (!moodData[dateStr]) {
        moodData[dateStr] = {};
    }

    if (!moodData[dateStr].partner && moodData[dateStr].partnerChecked === undefined) {
        moodData[dateStr].partnerChecked = true;
        if (Math.random() < 0.20) {
            saveMoodData();
            return;
        }
        const randomMood = MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)];
        moodData[dateStr].partner = randomMood.key;
        try {
            const cReplies = (typeof customReplies !== 'undefined') ? customReplies : (window._customReplies || []);
            const dDisabled = (typeof disabledDefaultReplies !== 'undefined') ? disabledDefaultReplies : (window._disabledDefaultReplies || []);
            const cConstants = (typeof CONSTANTS !== 'undefined') ? CONSTANTS : (window._CONSTANTS || { REPLY_MESSAGES: [] });
            const sourcePool = [...cReplies, ...cConstants.REPLY_MESSAGES.filter(t => !dDisabled.includes(t))];
            if (sourcePool.length > 0) {
                const count = Math.floor(Math.random() * 3) + 1;
                const chosen = [];
                const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
                for (let i = 0; i < Math.min(count, shuffled.length); i++) {
                    chosen.push(shuffled[i]);
                }
                moodData[dateStr].partnerNote = chosen.join('　');
            }
        } catch(e) {  }
        saveMoodData();
    }
}
function saveMoodData() {
    localforage.setItem(getStorageKey('moodCalendar'), moodData);
    window.moodData = moodData;
    var moodModal = document.getElementById('mood-modal');
    if (moodModal && !moodModal.classList.contains('hidden') && moodModal.style.display !== 'none') {
        renderMoodCalendar();
    }
}
function saveCustomMoodOptions() {
    localforage.setItem(getStorageKey('customMoodOptions'), customMoodOptions);
}
function getAllMoodOptions() {
    return [...MOOD_OPTIONS, ...customMoodOptions];
}
function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


let currentMoodSelection = null; 
function renderMoodCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    
    if (!grid || !monthLabel) return;

    grid.innerHTML = '';
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    monthLabel.textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); 

    let stats = {
        me: { total: 0, counts: {} },
        partner: { total: 0, counts: {} }
    };

    for (let i = 0; i < startDayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    const todayStr = formatDateStr(new Date());

    for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const dateObj = new Date(year, month, d);
        const dateStr = formatDateStr(dateObj);
        
        if (dateStr === todayStr) {
            dayDiv.classList.add('today');
            dayDiv.style.borderColor = 'var(--accent-color)';
        }

        const numSpan = document.createElement('span');
        numSpan.textContent = d;
        dayDiv.appendChild(numSpan);

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'mood-dots-container';

        const dayData = moodData[dateStr];
        
        if (dayData) {
            if (dayData.user) {
                const moodObj = getAllMoodOptions().find(m => m.key === dayData.user);
                if (moodObj) {
                    stats.me.counts[moodObj.key] = (stats.me.counts[moodObj.key] || 0) + 1;
                    stats.me.total++;
                    const dot = createMoodDot(moodObj, dayData.note, false);
                    dotsContainer.appendChild(dot);
                }
            }
            if (dayData.partner) {
                const moodObj = getAllMoodOptions().find(m => m.key === dayData.partner);
                if (moodObj) {
                    stats.partner.counts[moodObj.key] = (stats.partner.counts[moodObj.key] || 0) + 1;
                    stats.partner.total++;
                    const dot = createMoodDot(moodObj, dayData.partnerNote, true); 
                    dotsContainer.appendChild(dot);
                }
            }
        }

        dayDiv.appendChild(dotsContainer);

        dayDiv.addEventListener('click', () => {
            const dayEntry = moodData[dateStr];
            if (dayEntry && (dayEntry.user || dayEntry.partner)) {
                showDayDetails(dateStr, dayEntry);
            } else {
                openMoodSelector(dateStr, 'me');
            }
        });

        grid.appendChild(dayDiv);
    }

    updateDualMoodStats(stats);
}

function createMoodDot(moodObj, note, isPartner) {
    const dot = document.createElement('div');
    dot.className = `mood-detail-dot ${isPartner ? 'partner-mood' : ''}`;
    dot.style.backgroundColor = moodObj.color;
    
    if (isPartner) {
        dot.innerHTML = `
            <span class="mood-kaomoji-span">${moodObj.kaomoji}</span>
            <span class="mood-text-span">Ta</span>
        `;
    } else {
        const displayText = (note && note.trim()) ? note : moodObj.label;
        dot.innerHTML = `
            <span class="mood-kaomoji-span">${moodObj.kaomoji}</span>
            <span class="mood-text-span" style="margin-left:2px;">${displayText}</span>
        `;
    }
    return dot;
}
function updateDualMoodStats(stats) {
    const container = document.getElementById('mood-stats-container');
    if (!container) return;

    const mName = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    const pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';

    const myTotal = stats.me.total;
    const partnerTotal = stats.partner.total;
    
    const daysInMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate();
    const myPercent = daysInMonth > 0 ? (myTotal / daysInMonth) * 100 : 0;
    const partnerPercent = daysInMonth > 0 ? (partnerTotal / daysInMonth) * 100 : 0;

    let myDominant = { label: '无', kaomoji: '😶', color: '#ccc' };
    let myMaxCount = 0;
    Object.keys(stats.me.counts).forEach(key => {
        if (stats.me.counts[key] > myMaxCount) {
            myMaxCount = stats.me.counts[key];
            const m = getAllMoodOptions().find(o => o.key === key);
            if (m) myDominant = m;
        }
    });

    let partnerDominant = { label: '无', kaomoji: '😶', color: '#ccc' };
    let partnerMaxCount = 0;
    Object.keys(stats.partner.counts).forEach(key => {
        if (stats.partner.counts[key] > partnerMaxCount) {
            partnerMaxCount = stats.partner.counts[key];
            const m = getAllMoodOptions().find(o => o.key === key);
            if (m) partnerDominant = m;
        }
    });
    
    const createMoodBarHTML = (moodCounts, totalCount) => {
        if (totalCount <= 0) {
            return `<div class="mood-bar-container" style="justify-content: center; align-items: center; font-size: 10px; color: var(--text-secondary); background: var(--message-received-bg);">无数据</div>`;
        }

        const segments = Object.keys(moodCounts)
            .map(key => {
                const count = moodCounts[key];
                const moodObj = getAllMoodOptions().find(m => m.key === key);
                if (moodObj) {
                    const percentage = (count / totalCount) * 100;
                    return `<div class="mood-bar-segment" style="width: ${percentage}%; background-color: ${moodObj.color};" title="${moodObj.label}: ${count}天"></div>`;
                }
                return ''; 
            })
            .join(''); 
        return `<div class="mood-bar-container">${segments}</div>`;
    };

    const myBarHTML = createMoodBarHTML(stats.me.counts, myTotal);
    const partnerBarHTML = createMoodBarHTML(stats.partner.counts, partnerTotal);

    var todayStr = formatDateStr(new Date());
    var todayEntry = moodData[todayStr] || {};
    var myWeatherVal = todayEntry.myWeather || '';
    var partnerWeatherVal = todayEntry.partnerWeather || '';

    container.innerHTML = `
        <div class="mood-circles-wrapper" style="margin-bottom:20px;">
            <div class="mood-circle-item">
                <div class="mood-circle" style="--percent: ${myPercent}%">
                    <span class="mood-circle-text" style="color:var(--accent-color)">${myTotal}</span>
                </div>
                <div class="mood-circle-label">
                    <span class="mood-marker me" style="width:8px;height:8px;"></span> ${mName}
                </div>
                <div class="stats-weather-tag" onclick="editStatsWeather(this,'me')" title="点击编辑天气">
                    ${myWeatherVal ? `<span>${myWeatherVal}</span>` : `<span style="opacity:0.4;">+ 天气</span>`}
                </div>
            </div>
            <div class="mood-circle-item">
                <div class="mood-circle" style="--percent: ${partnerPercent}%; --accent-color: #ff6b6b;">
                    <span class="mood-circle-text" style="color:#ff6b6b">${partnerTotal}</span>
                </div>
                <div class="mood-circle-label">
                    <span class="mood-marker partner" style="width:8px;height:8px;"></span> ${pName}
                </div>
                <div class="stats-weather-tag" onclick="editStatsWeather(this,'partner')" title="点击编辑天气">
                    ${partnerWeatherVal ? `<span>${partnerWeatherVal}</span>` : `<span style="opacity:0.4;">+ 天气</span>`}
                </div>
            </div>
        </div>

        <div class="mood-stat-group">
            <div class="mood-stat-title">
                <span>我的心情</span>
                <div class="dominant-mood-tag">
                    <span style="color:${myDominant.color}; font-weight:bold;">${myDominant.kaomoji} ${myDominant.label}</span>
                </div>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                <span>记录天数: ${myTotal}</span>
            </div>
            ${myBarHTML}
        </div>

        <div class="mood-stat-group">
            <div class="mood-stat-title">
                <span>${pName}的心情</span>
                <div class="dominant-mood-tag">
                    <span style="color:${partnerDominant.color}; font-weight:bold;">${partnerDominant.kaomoji} ${partnerDominant.label}</span>
                </div>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                <span>记录天数: ${partnerTotal}</span>
            </div>
            ${partnerBarHTML}
        </div>
    `;
}

window.editStatsWeather = function(el, who) {
    if (el.querySelector('input')) return;
    var todayStr = formatDateStr(new Date());
    if (!moodData[todayStr]) moodData[todayStr] = {};
    var current = who === 'me' ? (moodData[todayStr].myWeather || '') : (moodData[todayStr].partnerWeather || '');
    var input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.maxLength = 20;
    input.placeholder = '今日天气…';
    input.style.cssText = 'width:100%;padding:3px 7px;border:1px solid var(--accent-color);border-radius:8px;font-size:12px;background:var(--primary-bg);color:var(--text-primary);outline:none;text-align:center;';
    el.innerHTML = '';
    el.appendChild(input);
    input.focus(); input.select();
    function save() {
        var val = input.value.trim();
        if (who === 'me') moodData[todayStr].myWeather = val;
        else moodData[todayStr].partnerWeather = val;
        saveMoodData();
        el.innerHTML = val ? `<span>${val}</span>` : `<span style="opacity:0.4;">+ 天气</span>`;
    }
    input.addEventListener('blur', save);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') { el.innerHTML = current ? `<span>${current}</span>` : `<span style="opacity:0.4;">+ 天气</span>`; }
    });
};

window.deleteDailyMood = function(dateStr, who) {
    if (!moodData[dateStr]) return;
    if (who === 'me') { delete moodData[dateStr].user; delete moodData[dateStr].note; delete moodData[dateStr].myWeather; }
    else { delete moodData[dateStr].partner; delete moodData[dateStr].partnerNote; delete moodData[dateStr].partnerWeather; }
    if (!moodData[dateStr].user && !moodData[dateStr].partner) delete moodData[dateStr];
    saveMoodData();
    renderMoodCalendar();
    showNotification('已删除心情记录', 'success');
    closeMoodOverlay();
};

function renderMoodOptionsGrid(targetKey) {
    const allMoods = getAllMoodOptions();
    const optionsGrid = document.getElementById('mood-options-grid');
    optionsGrid.innerHTML = allMoods.map(mood => {
        const isSelected = targetKey === mood.key;
        const isCustom = mood.key.startsWith('custom_');
        return `
        <div class="mood-option-btn${isCustom ? ' mood-option-custom' : ''}" 
             style="${isSelected ? `background:${mood.color}; color:#fff; border-color:${mood.color}; transform:scale(1.05); box-shadow:0 4px 10px rgba(0,0,0,0.15);` : ''}"
             onclick="tempSelectMood('${mood.key}')">
            <div class="mood-kaomoji" style="${isSelected ? 'color:#fff' : `color:${mood.color}`}">${mood.kaomoji}</div>
            <div class="mood-label">${mood.label}</div>
            ${isCustom ? `<div class="mood-custom-actions" onclick="event.stopPropagation()">
                <button class="mood-custom-action-btn" onclick="editCustomMood('${mood.key}')" title="编辑">✏️</button>
                <button class="mood-custom-action-btn" onclick="deleteCustomMood('${mood.key}')" title="删除">🗑</button>
            </div>` : ''}
        </div>
    `}).join('');
}

function switchMoodPage(dir) {
    currentMoodPage = Math.max(1, Math.min(2, currentMoodPage + dir));
    const page1 = document.getElementById('mood-page-1');
    const page2 = document.getElementById('mood-page-2');
    const indicator = document.getElementById('mood-page-indicator');
    const prevBtn = document.getElementById('mood-page-prev');
    const nextBtn = document.getElementById('mood-page-next');
    if (currentMoodPage === 1) {
        page1.style.display = 'block'; page2.style.display = 'none';
        indicator.textContent = '第 1 页 · 心情';
        prevBtn.disabled = true; nextBtn.disabled = false;
    } else {
        page1.style.display = 'none'; page2.style.display = 'block';
        const isPartner = currentMoodEditTarget === 'partner';
        indicator.textContent = '第 2 页 · 随记';
        document.getElementById('mood-note-label').textContent = isPartner ? '对方随记:' : '随记:';
        document.getElementById('mood-note-input').placeholder = isPartner ? '记录对方今天发生的事...' : '记录下今天发生的小事...';
        prevBtn.disabled = false; nextBtn.disabled = true;
    }
}
window.switchMoodPage = switchMoodPage;

function switchMoodEditTarget(target) {
    currentMoodEditTarget = target;
    document.getElementById('mood-tab-me').classList.toggle('active', target === 'me');
    document.getElementById('mood-tab-partner').classList.toggle('active', target === 'partner');
    const existing = moodData[selectedDateStr];
    let currentKey, noteVal;
    if (target === 'me') {
        currentKey = existing ? existing.user : null;
        noteVal = (existing && existing.note) ? existing.note : '';
    } else {
        currentKey = existing ? existing.partner : null;
        noteVal = (existing && existing.partnerNote) ? existing.partnerNote : '';
    }
    currentMoodSelection = currentKey;
    document.getElementById('mood-note-input').value = noteVal;
    renderMoodOptionsGrid(currentKey);
    switchMoodPage(0); 
}
window.switchMoodEditTarget = switchMoodEditTarget;

function openMoodSelector(dateStr, editTarget) {
    selectedDateStr = dateStr;
    window.selectedDateStr = dateStr;
    currentMoodEditTarget = editTarget || 'me';
    currentMoodPage = 1;
    currentMoodSelection = null;

    const overlay = document.getElementById('mood-selector-overlay');
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    const dateTitle = document.getElementById('mood-selector-date');

    if (window._moodOverlayRafId) {
        cancelAnimationFrame(window._moodOverlayRafId);
        window._moodOverlayRafId = null;
    }

    overlay.classList.remove('active');
    
    editorView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';

    const [y, m, d] = dateStr.split('-');
    dateTitle.textContent = `${m}月${d}日`;

    document.getElementById('mood-tab-me').classList.toggle('active', currentMoodEditTarget === 'me');
    document.getElementById('mood-tab-partner').classList.toggle('active', currentMoodEditTarget === 'partner');

    const existing = moodData[dateStr];
    let currentKey, noteVal, weatherVal;
    if (currentMoodEditTarget === 'me') {
        currentKey = existing ? existing.user : null;
        noteVal = (existing && existing.note) ? existing.note : '';
        weatherVal = (existing && existing.myWeather) ? existing.myWeather : '';
    } else {
        currentKey = existing ? existing.partner : null;
        noteVal = (existing && existing.partnerNote) ? existing.partnerNote : '';
        weatherVal = (existing && existing.partnerWeather) ? existing.partnerWeather : '';
    }
    currentMoodSelection = currentKey;
    document.getElementById('mood-note-input').value = noteVal;
    const weatherInput = document.getElementById('mood-weather-input');
    if (weatherInput) weatherInput.value = weatherVal;
    const weatherLabel = document.getElementById('mood-weather-label');
    if (weatherLabel) {
        var pNameW = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
        var mNameW = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
        if (weatherLabel.firstChild) weatherLabel.firstChild.textContent = currentMoodEditTarget === 'me' ? mNameW + '的天气\u00a0' : pNameW + '的天气\u00a0';
    }

    document.getElementById('mood-page-1').style.display = 'block';
    document.getElementById('mood-page-2').style.display = 'none';
    document.getElementById('mood-page-indicator').textContent = '第 1 页 · 心情';
    document.getElementById('mood-page-prev').disabled = true;
    document.getElementById('mood-page-next').disabled = false;

    renderMoodOptionsGrid(currentKey);
    window._moodOverlayRafId = requestAnimationFrame(() => {
        window._moodOverlayRafId = null;
        overlay.classList.add('active');
    });
}

window.editPartnerMoodRecord = function() {
    openMoodSelector(selectedDateStr, 'partner');
};

window.tempSelectMood = function(key) {
    currentMoodSelection = key;
    renderMoodOptionsGrid(key);
}

document.getElementById('confirm-mood-save').addEventListener('click', () => {
    if (!selectedDateStr) return;
    if (!currentMoodSelection && currentMoodPage === 1) {
        showNotification('请先选择一个心情图标', 'warning');
        return;
    }
    if (!moodData[selectedDateStr]) moodData[selectedDateStr] = {};
    const weatherVal = (document.getElementById('mood-weather-input') || {}).value || '';
    if (currentMoodEditTarget === 'me') {
        if (currentMoodSelection) moodData[selectedDateStr].user = currentMoodSelection;
        moodData[selectedDateStr].note = document.getElementById('mood-note-input').value.trim();
        moodData[selectedDateStr].myWeather = weatherVal.trim();
    } else {
        if (currentMoodSelection) moodData[selectedDateStr].partner = currentMoodSelection;
        moodData[selectedDateStr].partnerNote = document.getElementById('mood-note-input').value.trim();
        moodData[selectedDateStr].partnerWeather = weatherVal.trim();
    }
    
    saveMoodData();
    closeMoodOverlay();
    showNotification('记录已保存 ✦', 'success');
});

function showDayDetails(dateStr, data) {
    selectedDateStr = dateStr;
    window.selectedDateStr = dateStr;
    const overlay = document.getElementById('mood-selector-overlay');
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    
    const allMoods = getAllMoodOptions();
    const moodObj = allMoods.find(m => m.key === data.user);

    const [y, m, d] = dateStr.split('-');
    document.getElementById('detail-date').textContent = `${m}月${d}日`;

    const mySection = document.getElementById('detail-my-section');
    if (moodObj) {
        mySection.style.display = 'block';
        document.getElementById('detail-kaomoji').textContent = moodObj.kaomoji;
        document.getElementById('detail-label').textContent = moodObj.label;
        document.getElementById('detail-label').style.color = moodObj.color;
        document.getElementById('detail-text').textContent = data.note || "（这天没有写下随记...）";
        detailView.style.borderLeftColor = moodObj.color;
        const myWeatherEl = document.getElementById('detail-my-weather');
        if (myWeatherEl) {
            if (data.myWeather) { myWeatherEl.style.display = 'block'; document.getElementById('detail-my-weather-val').textContent = data.myWeather; }
            else myWeatherEl.style.display = 'none';
        }
    } else {
        mySection.style.display = 'none';
    }

    const partnerSection = document.getElementById('detail-partner-section');
    const partnerNoRecord = document.getElementById('detail-partner-no-record');
    if (data.partner) {
        const partnerMoodObj = allMoods.find(mo => mo.key === data.partner);
        if (partnerMoodObj) {
            partnerSection.style.display = 'block';
            if (partnerNoRecord) partnerNoRecord.style.display = 'none';
            document.getElementById('detail-partner-kaomoji').textContent = partnerMoodObj.kaomoji;
            document.getElementById('detail-partner-label').textContent = partnerMoodObj.label;
            document.getElementById('detail-partner-label').style.color = partnerMoodObj.color;
            document.getElementById('detail-partner-text').textContent = data.partnerNote || "（Ta 这天没有写下任何随记）";
            const partnerWeatherEl = document.getElementById('detail-partner-weather');
            if (partnerWeatherEl) {
                if (data.partnerWeather) { partnerWeatherEl.style.display = 'block'; document.getElementById('detail-partner-weather-val').textContent = data.partnerWeather; }
                else partnerWeatherEl.style.display = 'none';
            }
        } else {
            partnerSection.style.display = 'none';
            if (partnerNoRecord) partnerNoRecord.style.display = 'none';
        }
    } else {
        partnerSection.style.display = 'none';
        if (partnerNoRecord) partnerNoRecord.style.display = 'block';
    }

    editorView.style.display = 'none';
    detailView.style.display = 'block';
    overlay.classList.add('active');
}

document.getElementById('edit-existing-mood').addEventListener('click', () => {
    const editorView = document.getElementById('mood-editor-view');
    const detailView = document.getElementById('mood-detail-view');
    openMoodSelector(selectedDateStr, 'me');
    editorView.style.display = 'block';
    detailView.style.display = 'none';
});

window.closeMoodOverlay = function() {
    if (window._moodOverlayRafId) {
        cancelAnimationFrame(window._moodOverlayRafId);
        window._moodOverlayRafId = null;
    }
    const overlay = document.getElementById('mood-selector-overlay');
    if(overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.opacity = '';
            overlay.style.transition = '';
            const customDialog = document.getElementById('custom-mood-dialog');
            if(customDialog) customDialog.style.display = 'none';
        }, 250);
    }
};
window.viewMoodDetailFromEditor = function() {
    if (!selectedDateStr || !moodData[selectedDateStr]) return;
    showDayDetails(selectedDateStr, moodData[selectedDateStr]);
};
document.getElementById('cancel-mood-edit').addEventListener('click', closeMoodOverlay);

window.openCustomMoodDialog = function() {
    const dialog = document.getElementById('custom-mood-dialog');
    document.getElementById('custom-mood-emoji').value = '';
    document.getElementById('custom-mood-label').value = '';
    customMoodSelectedColor = CUSTOM_MOOD_COLORS[0];
    const colorsEl = document.getElementById('custom-mood-colors');
    colorsEl.innerHTML = CUSTOM_MOOD_COLORS.map((c,i) => 
        `<div class="custom-mood-color-dot ${i===0?'selected':''}" style="background:${c};" onclick="selectCustomColor('${c}',this)"></div>`
    ).join('');
    const saveBtn = dialog.querySelector('.modal-btn-primary');
    saveBtn.onclick = window.saveCustomMood;
    dialog.style.display = 'block';
};
window.selectCustomColor = function(color, el) {
    customMoodSelectedColor = color;
    document.querySelectorAll('.custom-mood-color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
};
window.closeCustomMoodDialog = function() {
    document.getElementById('custom-mood-dialog').style.display = 'none';
};
window.saveCustomMood = function() {
    const emoji = document.getElementById('custom-mood-emoji').value.trim();
    const label = document.getElementById('custom-mood-label').value.trim();
    if (!emoji || !label) { showNotification('请填写表情和名称', 'warning'); return; }
    const key = 'custom_' + Date.now();
    customMoodOptions.push({ key, kaomoji: emoji, label, color: customMoodSelectedColor });
    saveCustomMoodOptions();
    closeCustomMoodDialog();
    renderMoodOptionsGrid(currentMoodSelection);
    showNotification('自定义心情已添加 ✦', 'success');
};

window.deleteCustomMood = function(key) {
    customMoodOptions = customMoodOptions.filter(m => m.key !== key);
    saveCustomMoodOptions();
    renderMoodOptionsGrid(currentMoodSelection);
    showNotification('已删除自定义心情', 'success');
};

window.editCustomMood = function(key) {
    const mood = customMoodOptions.find(m => m.key === key);
    if (!mood) return;
    const dialog = document.getElementById('custom-mood-dialog');
    document.getElementById('custom-mood-emoji').value = mood.kaomoji;
    document.getElementById('custom-mood-label').value = mood.label;
    customMoodSelectedColor = mood.color;
    const colorsEl = document.getElementById('custom-mood-colors');
    colorsEl.innerHTML = CUSTOM_MOOD_COLORS.map((c) => 
        `<div class="custom-mood-color-dot ${c===mood.color?'selected':''}" style="background:${c};" onclick="selectCustomColor('${c}',this)"></div>`
    ).join('');
    dialog.style.display = 'block';
    dialog._editingKey = key;
    const saveBtn = dialog.querySelector('.modal-btn-primary');
    saveBtn.onclick = function() {
        const emoji = document.getElementById('custom-mood-emoji').value.trim();
        const label = document.getElementById('custom-mood-label').value.trim();
        if (!emoji || !label) { showNotification('请填写表情和名称', 'warning'); return; }
        const idx = customMoodOptions.findIndex(m => m.key === key);
        if (idx !== -1) customMoodOptions[idx] = { key, kaomoji: emoji, label, color: customMoodSelectedColor };
        saveCustomMoodOptions();
        closeCustomMoodDialog();
        saveBtn.onclick = null;
        renderMoodOptionsGrid(currentMoodSelection);
        showNotification('自定义心情已更新 ✦', 'success');
    };
};

function initMoodListeners() {
    const btnCalendar = document.getElementById('btn-view-calendar');
    const btnStats = document.getElementById('btn-view-stats');
    const viewCalendar = document.getElementById('mood-calendar-view');
    const viewStats = document.getElementById('mood-stats-view');

    if (btnCalendar && !btnCalendar.dataset.initialized) {
        btnCalendar.dataset.initialized = 'true';
        btnCalendar.addEventListener('click', () => {
            btnCalendar.classList.add('active');
            btnStats.classList.remove('active');
            viewCalendar.classList.remove('hidden-view');
            viewStats.classList.add('hidden-view');
        });
    }

    if (btnStats && !btnStats.dataset.initialized) {
        btnStats.dataset.initialized = 'true';
        btnStats.addEventListener('click', () => {
            btnStats.classList.add('active');
            btnCalendar.classList.remove('active');
            viewStats.classList.remove('hidden-view');
            viewCalendar.classList.add('hidden-view');
            renderMoodCalendar(); 
        });
    }

    const entryBtn = document.getElementById('mood-function');
    const modal = document.getElementById('mood-modal');
    
    if (entryBtn && !entryBtn.dataset.initialized) {
        entryBtn.dataset.initialized = 'true';
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        
        newBtn.addEventListener('click', () => {
            if (typeof window.updateDynamicNames === 'function') window.updateDynamicNames();
            const advModal = document.getElementById('advanced-modal');
            if (advModal) hideModal(advModal); 
            setTimeout(() => {
                renderMoodCalendar();
                showModal(modal);
            }, 150); 
        });
    }

    const closeMoodBtn = document.getElementById('close-mood');
    if (closeMoodBtn && !closeMoodBtn.dataset.initialized) {
        closeMoodBtn.dataset.initialized = 'true';
        closeMoodBtn.addEventListener('click', () => hideModal(modal));
    }
    
    const cancelMoodBtn = document.getElementById('cancel-mood-edit');
    if (cancelMoodBtn && !cancelMoodBtn.dataset.initialized) {
        cancelMoodBtn.dataset.initialized = 'true';
        cancelMoodBtn.addEventListener('click', closeMoodOverlay);
    }

    const overlay = document.getElementById('mood-selector-overlay');
    if (overlay && !overlay.dataset.initialized) {
        overlay.dataset.initialized = 'true';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMoodOverlay();
            }
        });
    }

    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn && !prevMonthBtn.dataset.initialized) {
        prevMonthBtn.dataset.initialized = 'true';
        prevMonthBtn.addEventListener('click', () => {
            const y = currentCalendarDate.getFullYear();
            const m = currentCalendarDate.getMonth();
            currentCalendarDate = new Date(y, m - 1, 1);
            renderMoodCalendar();
        });
    }
    
    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn && !nextMonthBtn.dataset.initialized) {
        nextMonthBtn.dataset.initialized = 'true';
        nextMonthBtn.addEventListener('click', () => {
            const y = currentCalendarDate.getFullYear();
            const m = currentCalendarDate.getMonth();
            currentCalendarDate = new Date(y, m + 1, 1);
            renderMoodCalendar();
        });
    }
}
let envelopeData = { outbox: [], inbox: [] }; 
let currentEnvTab = 'outbox';
let editingEnvId = null; 
let editingEnvSection = null; 

async function loadEnvelopeData() {
    const saved = await localforage.getItem(getStorageKey('envelopeData'));
    if (saved) envelopeData = saved;
    const oldPending = await localforage.getItem(getStorageKey('pending_envelope'));
    if (oldPending && envelopeData.outbox.length === 0) {
        envelopeData.outbox.push({
            id: 'legacy_' + Date.now(),
            content: '（历史寄出的信件）',
            sentTime: oldPending.sentTime,
            replyTime: oldPending.replyTime,
            status: 'pending'
        });
        await localforage.removeItem(getStorageKey('pending_envelope'));
        saveEnvelopeData();
    }
}

function saveEnvelopeData() {
    localforage.setItem(getStorageKey('envelopeData'), envelopeData);
}

async function checkEnvelopeStatus() {
    await loadEnvelopeData();
    const now = Date.now();
    let changed = false;
    let newReplyLetter = null;
    envelopeData.outbox.forEach(letter => {
        if (letter.status === 'pending' && now >= letter.replyTime) {
            letter.status = 'replied';
            const replyContent = generateEnvelopeReplyText();
            const replyId = 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
            const inboxLetter = {
                id: replyId,
                refId: letter.id,
                originalContent: letter.content,
                content: replyContent,
                receivedTime: Date.now(),
                isNew: true
            };
            envelopeData.inbox.push(inboxLetter);
            newReplyLetter = inboxLetter;
            changed = true;
            playSound('message');
        }
    });
    if (changed) {
        saveEnvelopeData();
        if (newReplyLetter) showEnvelopeReplyPopup(newReplyLetter);
    }
}

function showEnvelopeReplyPopup(letter) {
    const existing = document.getElementById('envelope-reply-popup');
    if (existing) existing.remove();
    const popup = document.createElement('div');
    popup.id = 'envelope-reply-popup';
    popup.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--secondary-bg);border:1px solid var(--border-color);border-radius:20px;padding:18px 20px;z-index:8000;max-width:320px;width:88%;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;gap:12px;animation:slideUpNotif 0.4s cubic-bezier(0.22,1,0.36,1);';
    popup.innerHTML = `
        <style>@keyframes slideUpNotif{from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.9)}60%{transform:translateX(-50%) translateY(-4px) scale(1.02)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}</style>
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:26px;">💌</span>
            <div>
                <div style="font-size:14px;font-weight:700;color:var(--text-primary);">收到了一封回信</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;opacity:0.8;">Ta 给你写了回信，快去看看吧~</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;">
            <button onclick="document.getElementById('envelope-reply-popup').remove();" style="flex:1;padding:8px 0;border-radius:12px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">稍后查看</button>
            <button onclick="openEnvelopeAndViewReply('${letter.id}');" style="flex:2;padding:8px 0;border-radius:12px;border:none;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">立即阅读 ✉</button>
        </div>`;
    document.body.appendChild(popup);
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 8000);
}

const APPEARANCE_PANEL_TITLES = {
    'theme': '主题配色', 'font': '字体设置', 'background': '聊天背景',
    'bubble': '气泡样式', 'avatar': '聊天头像', 'css': '自定义CSS',
    'font-bg': '背景 & 字体', 'bubble-css': '气泡 & CSS'
};
window.showAppearancePanel = function(panel) {
    const panelMap = {
        'font-bg': ['font', 'background'],
        'bubble-css': ['bubble', 'css']
    };
    document.getElementById('appearance-nav-grid').style.display = 'none';
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'none';
    document.getElementById('appearance-panel-container').style.display = 'block';
    document.getElementById('appearance-panel-title').textContent = APPEARANCE_PANEL_TITLES[panel] || panel;
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    if (panelMap[panel]) {
        panelMap[panel].forEach(sub => {
            const target = document.getElementById('appearance-panel-' + sub);
            if (target) target.style.display = 'block';
        });
    } else {
        const target = document.getElementById('appearance-panel-' + panel);
        if (target) target.style.display = 'block';
    }
    if (panel === 'bubble' || panel === 'bubble-css') { setTimeout(() => { if (typeof window.updateBubblePreviewFn === 'function') window.updateBubblePreviewFn(); }, 50); }
};
window.hideAppearancePanel = function() {
    document.getElementById('appearance-nav-grid').style.display = 'grid';
    document.getElementById('appearance-panel-container').style.display = 'none';
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'flex';
};

window.openEnvelopeAndViewReply = function(replyId) {
    const popup = document.getElementById('envelope-reply-popup');
    if (popup) popup.remove();
    const envelopeModal = document.getElementById('envelope-modal');
    showModal(envelopeModal);
    setTimeout(() => {
        switchEnvTab('inbox');
        viewEnvLetter('inbox', replyId);
    }, 200);
};

function generateEnvelopeReplyText() {
    const sourcePool = [...customReplies, ...CONSTANTS.REPLY_MESSAGES.filter(t => !disabledDefaultReplies.includes(t))];
    const sentenceCount = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
    let replyContent = "";
    for (let i = 0; i < sentenceCount; i++) {
        const randomSentence = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        const punctuation = Math.random() < 0.2 ? "！" : (Math.random() < 0.2 ? "..." : "。");
        replyContent += randomSentence + punctuation;
    }
    return replyContent;
}



window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    document.getElementById('env-tab-outbox').classList.toggle('active', tab === 'outbox');
    document.getElementById('env-tab-inbox').classList.toggle('active', tab === 'inbox');
    document.getElementById('env-outbox-section').style.display = tab === 'outbox' ? 'block' : 'none';
    document.getElementById('env-inbox-section').style.display = tab === 'inbox' ? 'block' : 'none';
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    renderEnvelopeLists();
};

function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
    const pendingCount = envelopeData.outbox.filter(l => l.status === 'pending').length;
    const newInboxCount = envelopeData.inbox.filter(l => l.isNew).length;
    const outboxBadge = document.getElementById('env-outbox-badge');
    const inboxBadge = document.getElementById('env-inbox-badge');
    if (outboxBadge) { outboxBadge.textContent = pendingCount; outboxBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none'; }
    if (inboxBadge) { inboxBadge.textContent = newInboxCount; inboxBadge.style.display = newInboxCount > 0 ? 'inline-block' : 'none'; }
    const envelopeEntryBadge = document.getElementById('env-entry-badge');
    if (envelopeEntryBadge) { envelopeEntryBadge.style.display = newInboxCount > 0 ? 'inline-block' : 'none'; }
}

function renderOutboxList() {
    const list = document.getElementById('env-outbox-list');
    if (!list) return;
    if (envelopeData.outbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有寄出任何信件</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">提笔写下心意，寄送给Ta吧~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.outbox.slice().reverse().map(letter => {
        const date = new Date(letter.sentTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const isPending = letter.status === 'pending';
        const replyTime = isPending ? new Date(letter.replyTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '';
        const statusIcon = isPending
            ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
            : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        const statusText = isPending ? `${statusIcon} 预计 ${replyTime} 回信` : `${statusIcon} 已收到回信`;
        const preview = letter.content.length > 38 ? letter.content.substring(0, 38) + '…' : letter.content;
        return `
        <div class="env-letter-item" onclick="viewEnvLetter('outbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                    寄出 · ${date}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
            </div>
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
                <div class="env-letter-status">${statusText}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'outbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderInboxList() {
    const list = document.getElementById('env-inbox-list');
    if (!list) return;
    if (envelopeData.inbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/><polyline points="22 13 12 13"/><path d="M19 16l-5-3-5 3"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有收到回信</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">对方正在认真回复中，请稍候~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.inbox.slice().reverse().map(letter => {
        const date = new Date(letter.receivedTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const preview = letter.content.length > 50 ? letter.content.substring(0, 50) + '…' : letter.content;
        const isNew = letter.isNew;
        return `
        <div class="env-letter-item reply ${isNew ? 'env-letter-new' : ''}" onclick="viewEnvLetter('inbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                    收到 · ${date}
                    ${isNew ? '<span style="background:rgba(255,255,255,0.3);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:6px;">新</span>' : ''}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
            </div>
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'inbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

window.viewEnvLetter = function(section, id) {
    const letters = section === 'outbox' ? envelopeData.outbox : envelopeData.inbox;
    const letter = letters.find(l => l.id === id);
    if (!letter) return;
    if (section === 'inbox' && letter.isNew) {
        letter.isNew = false;
        saveEnvelopeData();
        renderEnvelopeLists();
    }
    editingEnvId = id;
    editingEnvSection = section;

    document.getElementById('env-view-title').textContent = section === 'outbox' ? '寄出的信' : '收到的回信';

    const dateObj = letter.timestamp ? new Date(letter.timestamp) : new Date();
    const y = dateObj.getFullYear();
    const mo = String(dateObj.getMonth()+1).padStart(2,'0');
    const d = String(dateObj.getDate()).padStart(2,'0');
    const dateStr = `${y}/${mo}/${d}`;
    const weekdays = ['日','一','二','三','四','五','六'];
    const fullDateStr = dateStr + ' 星期' + weekdays[dateObj.getDay()];

    const stampEl = document.getElementById('env-view-stamp-date');
    if (stampEl) stampEl.textContent = `${mo}/${d}`;

    const dateLine = document.getElementById('env-view-date-line');
    if (dateLine) dateLine.textContent = fullDateStr;

    const toLine = document.getElementById('env-view-to-line');
    const greetingLine = document.getElementById('env-view-greeting-line');
    if (section === 'outbox') {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '亲爱的';
        if (toLine) toLine.textContent = `致 ${partnerName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，望君安好。';
    } else {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (toLine) toLine.textContent = `致 ${myName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，一切皆好。';
    }

    const textEl = document.getElementById('env-view-text');
    if (textEl) textEl.textContent = letter.content;

    const signDateEl = document.getElementById('env-view-sign-date');
    const signNameEl = document.getElementById('env-view-sign-name');
    if (signDateEl) signDateEl.textContent = fullDateStr;
    if (section === 'outbox') {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (signNameEl) signNameEl.textContent = myName;
    } else {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '对方';
        if (signNameEl) signNameEl.textContent = partnerName;
    }

    document.getElementById('env-edit-input').value = letter.content;
    document.getElementById('env-view-content').style.display = 'block';
    document.getElementById('env-view-edit').style.display = 'none';
    document.getElementById('env-view-edit-btn').style.display = 'inline-flex';
    document.getElementById('env-view-save-btn').style.display = 'none';
    showModal(document.getElementById('envelope-view-modal'));
};

window.toggleEnvEdit = function() {
    const contentEl = document.getElementById('env-view-content');
    const editEl = document.getElementById('env-view-edit');
    const editBtn = document.getElementById('env-view-edit-btn');
    const saveBtn = document.getElementById('env-view-save-btn');
    const isEditing = editEl.style.display !== 'none';
    if (isEditing) {
        contentEl.style.display = 'block';
        editEl.style.display = 'none';
        editBtn.textContent = '编辑';
        saveBtn.style.display = 'none';
    } else {
        contentEl.style.display = 'none';
        editEl.style.display = 'block';
        editBtn.textContent = '取消';
        saveBtn.style.display = 'inline-flex';
    }
};

window.saveEnvEdit = function() {
    const newContent = document.getElementById('env-edit-input').value.trim();
    if (!newContent) { showNotification('内容不能为空', 'warning'); return; }
    const letters = editingEnvSection === 'outbox' ? envelopeData.outbox : envelopeData.inbox;
    const letter = letters.find(l => l.id === editingEnvId);
    if (letter) {
        letter.content = newContent;
        saveEnvelopeData();
        const textEl = document.getElementById('env-view-text');
        if (textEl) textEl.textContent = newContent;
        showNotification('已保存修改', 'success');
        toggleEnvEdit();
    }
};

window.closeEnvViewModal = function() {
    hideModal(document.getElementById('envelope-view-modal'));
};

window.deleteEnvLetter = function(event, section, id) {
    event.stopPropagation();
    if (!confirm('确定要删除这封信吗？')) return;
    if (section === 'outbox') {
        envelopeData.outbox = envelopeData.outbox.filter(l => l.id !== id);
    } else {
        envelopeData.inbox = envelopeData.inbox.filter(l => l.id !== id);
    }
    saveEnvelopeData();
    renderEnvelopeLists();
    showNotification('已删除', 'success');
};

window.openNewEnvelopeForm = function() {
    document.getElementById('env-outbox-section').style.display = 'none';
    document.getElementById('env-inbox-section').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'none';
    document.getElementById('env-compose-title').textContent = '写一封信';
    document.getElementById('envelope-input').value = '';
    document.getElementById('env-send-to-chat').checked = false;
    document.getElementById('env-compose-form').style.display = 'block';
};

window.cancelEnvelopeCompose = function() {
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    if (currentEnvTab === 'outbox') {
        document.getElementById('env-outbox-section').style.display = 'block';
    } else {
        document.getElementById('env-inbox-section').style.display = 'block';
    }
};

function handleSendEnvelope() {
    const text = document.getElementById('envelope-input').value.trim();
    if (!text) { showNotification('信件内容不能为空', 'warning'); return; }

    const sendToChat = document.getElementById('env-send-to-chat').checked;
    if (sendToChat) {
        addMessage({ id: Date.now(), sender: 'user', text: `【寄出的信】\n${text}`, timestamp: new Date(), status: 'sent', type: 'normal' });
    }

    const minHours = 10, maxHours = 24;
    const randomHours = Math.random() * (maxHours - minHours) + minHours;
    const replyTime = Date.now() + randomHours * 60 * 60 * 1000;
    const newId = 'env_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
    envelopeData.outbox.push({
        id: newId, content: text,
        sentTime: Date.now(), replyTime,
        status: 'pending'
    });
    saveEnvelopeData();

    cancelEnvelopeCompose();
    switchEnvTab('outbox');
    showNotification(`信件已寄出，预计 ${Math.floor(randomHours)} 小时后收到回信 ✉️`, 'success');
}

function setupEventListeners() {
    console.log("正在初始化事件监听..."); 
    
    try {
        initCoreListeners();
        initModalListeners();
        initChatActionListeners();
        initHeaderAndSettingsListeners();
        initDataManagementListeners();
        initNewFeatureListeners();
        setupTutorialListeners();
        initMoodListeners();
        initDecisionModule(); 
        initAnniversaryModule(); 
        initThemeEditor(); 
        initThemeSchemes();
        
        initComboMenu(); 
        
    } catch (e) {
        console.error("事件绑定过程中发生错误:", e);
    }
}
let wheelOptions = ["是", "否", "再想一想", "听你的"];
let wheelResultText = "";

function initDecisionModule() {
    const entryBtn = document.getElementById('decision-function'); 
    if(entryBtn) {
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        newBtn.addEventListener('click', () => {
            hideModal(document.getElementById('advanced-modal'));
            showModal(document.getElementById('decision-menu-modal'));
        });
    }

    const openCoinBtn = document.getElementById('open-coin-toss');
    const openWheelBtn = document.getElementById('open-wheel');
    const closeMenuBtn = document.getElementById('close-decision-menu');
    const closeWheelBtn = document.getElementById('close-wheel');
    const addOptionBtn = document.getElementById('add-wheel-option');
    const spinBtn = document.getElementById('spin-wheel-btn');
    const sendResultBtn = document.getElementById('send-wheel-result');

    if (openCoinBtn && !openCoinBtn.dataset.initialized) {
        openCoinBtn.addEventListener('click', () => {
            hideModal(document.getElementById('decision-menu-modal'));
            handleCoinToss();
        });
        openCoinBtn.dataset.initialized = 'true';
    }

    if (openWheelBtn && !openWheelBtn.dataset.initialized) {
        openWheelBtn.addEventListener('click', () => {
            hideModal(document.getElementById('decision-menu-modal'));
            initPicker();
            showModal(document.getElementById('wheel-modal'));
        });
        openWheelBtn.dataset.initialized = 'true';
    }
    
    if (closeMenuBtn && !closeMenuBtn.dataset.initialized) {
        closeMenuBtn.addEventListener('click', () => hideModal(document.getElementById('decision-menu-modal')));
        closeMenuBtn.dataset.initialized = 'true';
    }

    if (closeWheelBtn && !closeWheelBtn.dataset.initialized) {
        closeWheelBtn.addEventListener('click', () => hideModal(document.getElementById('wheel-modal')));
        closeWheelBtn.dataset.initialized = 'true';
    }

    if (addOptionBtn && !addOptionBtn.dataset.initialized) {
        addOptionBtn.addEventListener('click', () => {
            wheelOptions.push(`选项 ${wheelOptions.length + 1}`);
            renderPickerOptions();
            renderPickerCards();
        });
        addOptionBtn.dataset.initialized = 'true';
    }

    if (spinBtn && !spinBtn.dataset.initialized) {
        spinBtn.addEventListener('click', doPick);
        spinBtn.dataset.initialized = 'true';
    }
    
    if (sendResultBtn && !sendResultBtn.dataset.initialized) {
        sendResultBtn.addEventListener('click', () => {
            if(wheelResultText) {
                sendMessage(`✨ 随机抽签结果：${wheelResultText}`, 'normal');
                hideModal(document.getElementById('wheel-modal'));
                wheelResultText = "";
                sendResultBtn.style.display = 'none';
                const resultEl = document.getElementById('wheel-result');
                if (resultEl) { resultEl.textContent = ""; resultEl.classList.remove('show'); }
                spinBtn.disabled = false;
            }
        });
        sendResultBtn.dataset.initialized = 'true';
    }
}

function initPicker() {
    renderPickerOptions();
    renderPickerCards();
    const result = document.getElementById('wheel-result');
    const sendBtn = document.getElementById('send-wheel-result');
    const spinBtn = document.getElementById('spin-wheel-btn');
    if (result) { result.textContent = ""; result.classList.remove('show'); }
    if (sendBtn) sendBtn.style.display = 'none';
    if (spinBtn) spinBtn.disabled = false;
    wheelResultText = "";
}

function renderPickerOptions() {
    const list = document.getElementById('wheel-options-list');
    if (!list) return;
    list.innerHTML = '';
    const colors = ['#FFD93D','#FF6B6B','#6BCB77','#4D96FF','#E0C3FC','#FF9A8B','#A8D8EA','#C44569'];
    wheelOptions.forEach((opt, index) => {
        const item = document.createElement('div');
        item.className = 'picker-option-item';
        item.innerHTML = `
            <div class="picker-option-color-dot" style="background:${colors[index % colors.length]}"></div>
            <input type="text" class="picker-option-input" value="${opt}" placeholder="输入选项...">
            <span class="picker-option-remove"><i class="fas fa-times"></i></span>
        `;
        item.querySelector('input').addEventListener('input', (e) => {
            wheelOptions[index] = e.target.value;
            renderPickerCards();
        });
        item.querySelector('.picker-option-remove').addEventListener('click', () => {
            if(wheelOptions.length <= 2) {
                showNotification('至少保留两个选项', 'warning');
                return;
            }
            wheelOptions.splice(index, 1);
            renderPickerOptions();
            renderPickerCards();
        });
        list.appendChild(item);
    });
}

function renderPickerCards(selectedIndex = -1) {
    const row = document.getElementById('picker-cards-row');
    if (!row) return;
    const colors = ['#FFD93D','#FF6B6B','#6BCB77','#4D96FF','#E0C3FC','#FF9A8B','#A8D8EA','#C44569'];
    row.innerHTML = '';
    wheelOptions.forEach((opt, i) => {
        const card = document.createElement('div');
        card.className = 'picker-card';
        if (selectedIndex >= 0) {
            if (i === selectedIndex) card.classList.add('selected');
            else card.classList.add('unselected');
        }
        if (selectedIndex >= 0 && i === selectedIndex) {
            card.style.background = `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i+2) % colors.length]})`;
        } else {
            card.style.borderTop = `3px solid ${colors[i % colors.length]}`;
        }
        card.style.animationDelay = (i * 0.06) + 's';
        const label = opt || `选项${i+1}`;
        card.textContent = label.length > 6 ? label.slice(0,5) + '…' : label;
        row.appendChild(card);
    });
}

function doPick() {
    if (wheelOptions.length < 2) {
        showNotification("请至少添加两个选项", "warning");
        return;
    }
    const spinBtn = document.getElementById('spin-wheel-btn');
    const resultDisplay = document.getElementById('wheel-result');
    const sendBtn = document.getElementById('send-wheel-result');
    
    spinBtn.disabled = true;
    sendBtn.style.display = 'none';
    resultDisplay.classList.remove('show');
    resultDisplay.textContent = "";

    let flashCount = 0;
    const totalFlashes = 16 + Math.floor(Math.random() * 8);
    const finalIndex = Math.floor(Math.random() * wheelOptions.length);
    
    function flash() {
        const row = document.getElementById('picker-cards-row');
        if (!row) return;
        const cards = row.querySelectorAll('.picker-card');
        cards.forEach(c => c.style.transform = '');
        
        let showIdx;
        if (flashCount < totalFlashes - 3) {
            showIdx = Math.floor(Math.random() * wheelOptions.length);
        } else {
            showIdx = finalIndex;
        }
        
        cards.forEach((c, i) => {
            if (i === showIdx) {
                c.style.transform = 'translateY(-4px) scale(1.06)';
                c.style.background = `linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb),0.7))`;
                c.style.borderColor = 'transparent';
                c.style.color = '#fff';
            } else {
                c.style.transform = '';
                c.style.background = '';
                c.style.borderColor = '';
                c.style.color = '';
            }
        });
        
        flashCount++;
        const delay = flashCount < 8 ? 80 : flashCount < 14 ? 130 : 250;
        if (flashCount < totalFlashes) {
            setTimeout(flash, delay);
        } else {
            setTimeout(() => {
                renderPickerCards(finalIndex);
                wheelResultText = wheelOptions[finalIndex];
                resultDisplay.innerHTML = `<i class="fas fa-star" style="font-size:14px; margin-right:6px;"></i>${wheelResultText}`;
                resultDisplay.classList.add('show');
                spinBtn.disabled = false;
                sendBtn.style.display = 'inline-block';
                playSound('favorite');
            }, 300);
        }
    }
    
    flash();
}function initComboMenu() {
    const comboBtn = document.getElementById('combo-btn');
    const picker = document.getElementById('user-sticker-picker');
    const contentArea = document.getElementById('combo-content-area');
    
    if (!comboBtn || !picker) return;
    
    if (comboBtn.dataset.initialized) return;
    
    comboBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = picker.classList.contains('active');
        
        if (isActive) {
            picker.classList.remove('active');
        } else {
            switchTab('my-sticker');
            picker.classList.add('active');
        }
    });
    
    comboBtn.dataset.initialized = 'true';

    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && !comboBtn.contains(e.target)) {
            picker.classList.remove('active');
        }
    });

    const tabs = picker.querySelectorAll('.combo-tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    function updateAddBtnVisibility(tabId) {
        const addBtn = document.getElementById('sticker-add-btn');
        if (addBtn) addBtn.style.display = (tabId === 'my-sticker') ? 'flex' : 'none';
    }

    function switchTab(tabId) {
        tabs.forEach(b => b.classList.remove('active'));
        const activeBtn = Array.from(tabs).find(b => b.dataset.tab === tabId);
        if (activeBtn) activeBtn.classList.add('active');
        updateAddBtnVisibility(tabId);

        if (tabId === 'my-sticker') {
            renderMyStickerLibrary();
        } else if (tabId === 'partner-sticker') {
            renderPartnerStickerLibrary();
        } else {
            renderUserPokeMenu();
        }
    }

    function makeStickerItem(src, onClick) {
        const item = document.createElement('div');
        item.className = 'sticker-grid-item';
        item.innerHTML = `<img src="${src}" loading="lazy">`;
        item.onclick = (e) => { e.stopPropagation(); onClick(); };
        return item;
    }

    function renderMyStickerLibrary() {
        contentArea.innerHTML = '';
        if (!myStickerLibrary || myStickerLibrary.length === 0) {
            contentArea.innerHTML = `
                <div class="empty-sticker-tip">
                    <i class="fas fa-user-circle"></i>
                    还没有我的专属表情哦<br>
                    点击右上角"添加"按钮上传图片~
                </div>
            `;
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'sticker-grid-view';
        myStickerLibrary.forEach(src => {
            const item = makeStickerItem(src, () => {
                addMessage({ id: Date.now(), sender: 'user', text: '', timestamp: new Date(), image: src, status: 'sent', type: 'normal' });
                playSound('send');
                picker.classList.remove('active');
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                setTimeout(simulateReply, settings.replyDelayMin + Math.random() * delayRange);
            });
            grid.appendChild(item);
        });
        contentArea.appendChild(grid);
    }

    function renderPartnerStickerLibrary() {
        contentArea.innerHTML = '';
        if (!stickerLibrary || stickerLibrary.length === 0) {
            contentArea.innerHTML = `
                <div class="empty-sticker-tip">
                    <i class="far fa-images"></i>
                    对方表情库还是空的哦<br>
                    请去"高级功能"->"自定义回复"->"表情库"中添加图片~
                </div>
            `;
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'sticker-grid-view';
        stickerLibrary.forEach(src => {
            const item = makeStickerItem(src, () => {
                addMessage({ id: Date.now(), sender: 'user', text: '', timestamp: new Date(), image: src, status: 'sent', type: 'normal' });
                playSound('send');
                picker.classList.remove('active');
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                setTimeout(simulateReply, settings.replyDelayMin + Math.random() * delayRange);
            });
            grid.appendChild(item);
        });
        contentArea.appendChild(grid);
    }

    function renderStickerLibrary() { renderMyStickerLibrary(); }
    function renderUserPokeMenu() {
        contentArea.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'poke-list-view';

        const customBtn = document.createElement('button');
        customBtn.className = 'custom-poke-btn';
        customBtn.innerHTML = '<i class="fas fa-pen"></i> 自定义动作';
        customBtn.onclick = (e) => {
            e.stopPropagation();
            picker.classList.remove('active');
            showModal(DOMElements.pokeModal.modal, DOMElements.pokeModal.input);
        };
        wrapper.appendChild(customBtn);

        const userPresets = [
            "拍了拍对方的头",
            "戳了戳对方的脸颊",
            "抱住了对方",
            "给对方比了个心",
            "牵起了对方的手",
            "看着对方发呆"
        ];

        const title = document.createElement('div');
        title.style.fontSize = '12px';
        title.style.color = 'var(--text-secondary)';
        title.style.marginBottom = '5px';
        title.innerText = '快捷动作';
        wrapper.appendChild(title);

        userPresets.forEach(text => {
            const item = document.createElement('div');
            item.className = 'poke-quick-item';
            item.innerText = text;
            item.onclick = (e) => {
                e.stopPropagation();
                addMessage({
                    id: Date.now(),
                    text: `✦ ${settings.myName} ${text} ✦`, 
                    timestamp: new Date(),
                    type: 'system' 
                });
                picker.classList.remove('active');
                
                setTimeout(simulateReply, 1500);
            };
            wrapper.appendChild(item);
        });

        contentArea.appendChild(wrapper);
    }
}
function renderComboMenu() {
    const content = document.getElementById('user-sticker-content');
    content.innerHTML = '';
    
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex; gap:8px; padding:8px; border-bottom:1px solid var(--border-color);';
    tabBar.innerHTML = `
        <button class="combo-tab active" data-tab="emoji" style="flex:1; padding:8px; border:none; background:var(--accent-color); color:#fff; border-radius:8px; cursor:pointer;">
            😊 表情
        </button>
        <button class="combo-tab" data-tab="poke" style="flex:1; padding:8px; border:none; background:var(--secondary-bg); color:var(--text-primary); border-radius:8px; cursor:pointer;">
            ✨ 拍一拍
        </button>
    `;
    
    const contentArea = document.createElement('div');
    contentArea.id = 'combo-content-area';
    contentArea.style.cssText = 'padding:10px; max-height:240px; overflow-y:auto;';
    
    content.appendChild(tabBar);
    content.appendChild(contentArea);
    
    showEmojiTab();
    
    tabBar.querySelectorAll('.combo-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabBar.querySelectorAll('.combo-tab').forEach(b => {
                b.style.background = 'var(--secondary-bg)';
                b.style.color = 'var(--text-primary)';
                b.classList.remove('active');
            });
            btn.style.background = 'var(--accent-color)';
            btn.style.color = '#fff';
            btn.classList.add('active');
            
            if (btn.dataset.tab === 'emoji') {
                showEmojiTab();
            } else {
                showPokeTab();
            }
        });
    });
}

function showEmojiTab() {
    const area = document.getElementById('combo-content-area');
    area.innerHTML = '';
    area.style.display = 'grid';
    area.style.gridTemplateColumns = 'repeat(5, 1fr)';
    area.style.gap = '8px';
    
    CONSTANTS.REPLY_EMOJIS.forEach(emoji => {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.innerHTML = `<span style="font-size:24px;">${emoji}</span>`;
        item.onclick = () => {
            const input = document.getElementById('message-input');
            input.value += emoji;
            document.getElementById('user-sticker-picker').classList.remove('active');
            input.focus();
        };
        area.appendChild(item);
    });

    stickerLibrary.forEach(src => {
        const item = document.createElement('div');
        item.className = 'picker-item';
        item.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">`;
        item.onclick = () => {
            addMessage({
                id: Date.now(),
                sender: 'user',
                text: '',
                timestamp: new Date(),
                image: src,
                status: 'sent',
                type: 'normal'
            });
            playSound('send');
            document.getElementById('user-sticker-picker').classList.remove('active');
            
            const delayRange = settings.replyDelayMax - settings.replyDelayMin;
            const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
            setTimeout(simulateReply, randomDelay);
        };
        area.appendChild(item);
    });
}

function showPokeTab() {
    const area = document.getElementById('combo-content-area');
    area.innerHTML = '';
    area.style.display = 'flex';
    area.style.flexDirection = 'column';
    area.style.gap = '8px';
    
    const quickPokes = customPokes.slice(0, 6);
    
    quickPokes.forEach(pokeText => {
        const btn = document.createElement('button');
        btn.textContent = pokeText;
        btn.style.cssText = `
            padding: 10px 14px;
            background: linear-gradient(135deg, var(--secondary-bg), rgba(var(--accent-color-rgb),0.04));
            border: 1px solid rgba(var(--accent-color-rgb),0.15);
            border-radius: 12px;
            cursor: pointer;
            text-align: left;
            font-size: 13px;
            transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
            color: var(--text-primary);
            font-family: var(--font-family);
            width: 100%;
        `;
        btn.addEventListener('mouseover', () => {
            btn.style.background = 'linear-gradient(135deg, rgba(var(--accent-color-rgb),0.12), rgba(var(--accent-color-rgb),0.06))';
            btn.style.borderColor = 'var(--accent-color)';
            btn.style.transform = 'translateX(4px)';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.background = 'linear-gradient(135deg, var(--secondary-bg), rgba(var(--accent-color-rgb),0.04))';
            btn.style.borderColor = 'rgba(var(--accent-color-rgb),0.15)';
            btn.style.transform = '';
        });
        btn.onclick = () => {
            addMessage({
                id: Date.now(), 
                text: `✦ ${settings.myName} ${pokeText} ✦`, 
                timestamp: new Date(), 
                type: 'system'
            });
            document.getElementById('user-sticker-picker').classList.remove('active');
            const delayRange = settings.replyDelayMax - settings.replyDelayMin;
            const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
            setTimeout(simulateReply, randomDelay);
        };
        area.appendChild(btn);
    });
    
    const customBtn = document.createElement('button');
    customBtn.innerHTML = '<i class="fas fa-edit"></i> 自定义拍一拍';
    customBtn.style.cssText = `
        padding: 11px 14px;
        background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb),0.8));
        color: #fff;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        width: 100%;
        letter-spacing: 0.3px;
        margin-top: 4px;
        box-shadow: 0 4px 14px rgba(var(--accent-color-rgb), 0.25);
    `;
    customBtn.onclick = () => {
        document.getElementById('user-sticker-picker').classList.remove('active');
        showModal(DOMElements.pokeModal.modal, DOMElements.pokeModal.input);
    };
    area.appendChild(customBtn);
}
        function initCoreListeners() {


            DOMElements.chatContainer.addEventListener('scroll', () => {
                const container = DOMElements.chatContainer;


                if (container.scrollTop < 50 && !isLoadingHistory && messages.length > displayedMessageCount) {
                    isLoadingHistory = true;


                    const loader = document.getElementById('history-loader');
                    if (loader) loader.classList.add('visible');


                    setTimeout(() => {

                        displayedMessageCount += HISTORY_BATCH_SIZE;


                        renderMessages(true);


                        if (loader) loader.classList.remove('visible');
                        isLoadingHistory = false;
                    },
                        600);
                }
            });

            DOMElements.sendBtn.addEventListener('click', () => isBatchMode ? addToBatch(): sendMessage());
            DOMElements.messageInput.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); isBatchMode ? addToBatch(): sendMessage();
                }
            });
            DOMElements.messageInput.addEventListener('input', () => {
                DOMElements.messageInput.style.height = 'auto'; DOMElements.messageInput.style.height = `${Math.min(DOMElements.messageInput.scrollHeight, 120)}px`;
            });


            DOMElements.attachmentBtn.addEventListener('click', () => {

                const modal = document.createElement('div');
                modal.className = 'modal image-upload-modal';
                modal.style.cssText = `
            display: flex !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(8px);
            opacity: 0;
            transition: opacity 0.3s ease;
            `;

                modal.innerHTML = `
            <div class="modal-content" style="
            z-index: 10000;
            position: relative;
            background-color: var(--secondary-bg);
            border-radius: var(--radius);
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
            ">
            <div class="modal-title"><i class="fas fa-image"></i><span>发送图片</span></div>
            <div style="margin-bottom: 16px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button class="modal-btn modal-btn-secondary upload-mode-btn active" id="upload-image-file-btn" style="flex: 1;">选择文件</button>
            <button class="modal-btn modal-btn-secondary upload-mode-btn" id="paste-image-url-btn" style="flex: 1;">粘贴URL</button>
            </div>
            <input type="file" class="modal-input" id="image-file-input" accept="image/*">
            <input type="text" class="modal-input" id="image-url-input" placeholder="输入图片URL地址" style="display: none;">
            <div id="image-preview" style="text-align: center; margin-top: 10px; display: none;">
            <img id="preview-chat-image" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid var(--border-color);">
            </div>
            </div>
            <div class="modal-buttons">
            <button class="modal-btn modal-btn-secondary" id="cancel-image">取消</button>
            <button class="modal-btn modal-btn-primary" id="send-image" disabled>发送</button>
            </div>
            </div>
            `;

                document.body.appendChild(modal);


                setTimeout(() => {
                    modal.style.opacity = '1';
                    const content = modal.querySelector('.modal-content');
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 10);

                const fileInput = document.getElementById('image-file-input');
                const urlInput = document.getElementById('image-url-input');
                const uploadBtn = document.getElementById('upload-image-file-btn');
                const pasteUrlBtn = document.getElementById('paste-image-url-btn');
                const previewDiv = document.getElementById('image-preview');
                const previewImg = document.getElementById('preview-chat-image');
                const sendBtn = document.getElementById('send-image');
                const cancelBtn = document.getElementById('cancel-image');
                const uploadModeBtns = document.querySelectorAll('.upload-mode-btn');

                let currentImageData = null;


                function switchUploadMode(isFileMode) {
                    uploadModeBtns.forEach(btn => btn.classList.remove('active'));
                    if (isFileMode) {
                        uploadBtn.classList.add('active');
                        fileInput.style.display = 'block';
                        urlInput.style.display = 'none';
                    } else {
                        pasteUrlBtn.classList.add('active');
                        fileInput.style.display = 'none';
                        urlInput.style.display = 'block';
                        urlInput.focus();
                    }

                    previewDiv.style.display = 'none';
                    sendBtn.disabled = true;
                    currentImageData = null;
                }


                uploadBtn.addEventListener('click', () => switchUploadMode(true));


                pasteUrlBtn.addEventListener('click', () => switchUploadMode(false));


                fileInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        if (file.size > MAX_IMAGE_SIZE) {
                            showNotification('图片大小不能超过5MB', 'error');
                            return;
                        }
                        showNotification('正在优化图片...', 'info', 1500);
                        optimizeImage(file).then(optimizedData => {
                            currentImageData = optimizedData;
                            previewImg.src = currentImageData;
                            previewDiv.style.display = 'block';
                            sendBtn.disabled = false;
                        }).catch(() => {
                            showNotification('图片处理失败', 'error');
                        });
                    }
                });


                urlInput.addEventListener('input',
                    function() {
                        const url = urlInput.value.trim();
                        if (url) {

                            if (/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp))$/i.test(url)) {
                                previewImg.src = url;
                                previewDiv.style.display = 'block';
                                currentImageData = url;
                                sendBtn.disabled = false;


                                const img = new Image();
                                img.onload = function() {

                                    previewImg.src = url;
                                    showNotification('图片URL有效', 'success', 1000);
                                };
                                img.onerror = function() {
                                    showNotification('图片URL无效或无法访问', 'error');
                                    sendBtn.disabled = true;
                                    previewDiv.style.display = 'none';
                                };
                                img.src = url;
                            } else {
                                sendBtn.disabled = true;
                                previewDiv.style.display = 'none';
                            }
                        } else {
                            sendBtn.disabled = true;
                            previewDiv.style.display = 'none';
                        }
                    });


                sendBtn.addEventListener('click',
                    () => {
                        if (currentImageData) {

                            addMessage({
                                id: Date.now(),
                                sender: 'user',
                                text: '',
                                timestamp: new Date(),
                                image: currentImageData,
                                status: 'sent',
                                favorited: false,
                                note: null,
                                replyTo: currentReplyTo,
                                type: 'normal'
                            });
                            playSound('send');
                            currentReplyTo = null;
                            updateReplyPreview();
                            const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                            const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
                            setTimeout(simulateReply, randomDelay);


                            closeModal();
                        }
                    });


                cancelBtn.addEventListener('click',
                    closeModal);


                function closeModal() {
                    modal.style.opacity = '0';
                    const content = modal.querySelector('.modal-content');
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        if (modal.parentNode) {
                            modal.parentNode.removeChild(modal);
                        }
                    },
                        300);
                }


                modal.addEventListener('click',
                    (e) => {
                        if (e.target === modal) {
                            closeModal();
                        }
                    });


                modal.querySelector('.modal-content').addEventListener('click',
                    (e) => {
                        e.stopPropagation();
                    });


                const handleEscKey = (e) => {
                    if (e.key === 'Escape') {
                        closeModal();
                        document.removeEventListener('keydown', handleEscKey);
                    }
                };
                document.addEventListener('keydown', handleEscKey);


                modal.addEventListener('close', () => {
                    document.removeEventListener('keydown', handleEscKey);
                });
            });


            DOMElements.imageInput.addEventListener('change', () => {
                if (DOMElements.imageInput.files[0]) {
                    if (isBatchMode) {
                        showNotification('批量模式不支持图片', 'warning');
                        DOMElements.imageInput.value = '';
                    } else {
                        sendMessage();
                    }
                }
            });

            DOMElements.continueBtn.addEventListener('click', simulateReply);
            DOMElements.batchBtn.addEventListener('click', toggleBatchMode);
        }

function initChatActionListeners() {
            DOMElements.chatContainer.addEventListener('click', (e) => {

                if (isBatchFavoriteMode) {
                    const wrapper = e.target.closest('.message-wrapper');
                    if (wrapper && !e.target.closest('.message-meta-actions')) {
                        const messageId = Number(wrapper.dataset.id);
                        const index = selectedMessages.indexOf(messageId);

                        if (index > -1) {
                            selectedMessages.splice(index, 1);
                            wrapper.classList.remove('selected');
                        } else {
                            selectedMessages.push(messageId);
                            wrapper.classList.add('selected');
                        }

                        const confirmBtn = document.getElementById('confirm-batch-favorite');
                        if (confirmBtn) {
                            confirmBtn.textContent = `确认收藏 (${selectedMessages.length})`;
                        }
                        return;
                    }
                }

                const favoriteBtn = e.target.closest('.favorite-action-btn'); 
                if (favoriteBtn) {
                    const wrapper = e.target.closest('.message-wrapper');
                    const messageId = Number(wrapper.dataset.id);
                    const message = messages.find(m => m.id === messageId);
                    
                    if (message) {
                        message.favorited = !message.favorited;
                        
                        showNotification(message.favorited ? '已收藏': '已取消收藏', 'success', 1500);
                        playSound('favorite');
                        
                        throttledSaveData();
                        
                        renderMessages(true);
                    }
                    return;
                }

                const target = e.target.closest('.meta-action-btn');
                if (!target) return;
                
                const wrapper = e.target.closest('.message-wrapper');
                if (!wrapper) return; 
                
                const messageId = Number(wrapper.dataset.id);
                const message = messages.find(m => m.id === messageId);
                if (!message) return;

if (target.classList.contains('delete-btn')) {
    if (confirm('确定要删除这条消息吗？')) {
        const index = messages.findIndex(m => m.id === messageId);
        if (index > -1) {
            const savedScrollTop = DOMElements.chatContainer.scrollTop;
            messages.splice(index, 1); 
            throttledSaveData(); 
            renderMessages(true);
            requestAnimationFrame(() => {
                DOMElements.chatContainer.scrollTop = savedScrollTop;
            });
            showNotification('消息已删除', 'success');
        }
    }
    return;
}
                if (target.classList.contains('reply-btn')) {
                    currentReplyTo = {
                        id: message.id,
                        sender: message.sender,
                        text: message.text
                    };
                    updateReplyPreview();
                    DOMElements.messageInput.focus();
                    const targetMessageElement = DOMElements.chatContainer.querySelector(`[data-id="${message.id}"]`);
                    if (targetMessageElement) targetMessageElement.scrollIntoView({
                        behavior: 'smooth', block: 'center'
                    });
                    return;
                } 
                else if (target.classList.contains('note-btn')) {
                    currentNoteMessageId = messageId;
                    DOMElements.noteModal.input.value = message.note || '';
                    showModal(DOMElements.noteModal.modal, DOMElements.noteModal.input);
                    return;
                }

                throttledSaveData();
            });

            DOMElements.batchPreview.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.batch-preview-remove');
                if (removeBtn) {
                    const index = removeBtn.closest('.batch-preview-item').dataset.index;
                    batchMessages.splice(index, 1); updateBatchPreview();
                }
                const sendBtn = e.target.closest('.batch-send-btn');
                if (sendBtn && !sendBtn.disabled) sendBatchMessages();
                if (e.target.matches('.batch-cancel-btn')) {
                    isBatchMode = false; DOMElements.batchBtn.classList.remove('active');
                    DOMElements.batchPreview.style.display = 'none';
                    const placeholder = "";
                    DOMElements.messageInput.placeholder = placeholder.length > 20 ? placeholder.substring(0, 20) + "...": placeholder;
                    batchMessages = [];
                }
            });
        }
        function initModalListeners() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                const cancelBtns = modal.querySelectorAll('.modal-buttons .modal-btn-secondary');
                cancelBtns.forEach(cancelBtn => {
                    if (!cancelBtn.getAttribute('onclick') && !cancelBtn.dataset.noAutoClose) {
                        cancelBtn.addEventListener('click', () => hideModal(modal));
                    }
                });
            });

            DOMElements.editModal.input.addEventListener('input', () => {
                DOMElements.editModal.save.disabled = !DOMElements.editModal.input.value.trim();
            });
            DOMElements.noteModal.save.addEventListener('click', () => {
                const message = messages.find(m => m.id === currentNoteMessageId);
                if (message) {
                    message.note = DOMElements.noteModal.input.value.trim() || null;
                    throttledSaveData();
                    renderMessages(true);
                    showNotification('注释已保存', 'success');
                }
                hideModal(DOMElements.noteModal.modal);
            });

            DOMElements.pokeModal.save.addEventListener('click', () => {
                let pokeText = DOMElements.pokeModal.input.value.trim() || `${settings.myName} 拍了拍 ${settings.partnerName}`;
                addMessage({
                    id: Date.now(), text: `✦ ${pokeText} ✦`, timestamp: new Date(), type: 'system'
                });
                hideModal(DOMElements.pokeModal.modal);
                DOMElements.pokeModal.input.value = '';
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                const randomDelay = settings.replyDelayMin + Math.random() * delayRange;
                setTimeout(simulateReply, randomDelay);
            });


            DOMElements.cancelCoinResult.addEventListener('click', () => {
                DOMElements.coinTossOverlay.classList.remove('visible', 'finished');
                lastCoinResult = null;
            });


            DOMElements.sendCoinResult.addEventListener('click', () => {
                if (lastCoinResult) {
                    sendMessage(`🎲 抛硬币结果：${lastCoinResult}`, 'normal');
                    DOMElements.coinTossOverlay.classList.remove('visible', 'finished');
                    lastCoinResult = null;
                }
            });


            const retryBtn = document.getElementById('retry-coin-toss');

            if (retryBtn) {
                retryBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    startCoinFlipAnimation();
                });
            }
        }

        function initHeaderAndSettingsListeners() {

            const openNameModal = (isPartner) => {
                const modal = DOMElements.editModal;
                showModal(modal.modal, modal.input);
                modal.title.textContent = `修改${isPartner ? (settings.partnerName || '对方'): '我'}的昵称`;
                modal.input.value = isPartner ? settings.partnerName: settings.myName;
                modal.save.disabled = !modal.input.value.trim();
                modal.save.onclick = () => {
                    const newName = modal.input.value.trim();
                    if (newName) {
                        isPartner ? settings.partnerName = newName: settings.myName = newName;
                        throttledSaveData();
                        updateUI();
                        showNotification('昵称已更新', 'success');
                    }
                    hideModal(modal.modal);
                };
            };

            const openAvatarModal = (isPartner) => {
                const modal = DOMElements.avatarModal;

                modal.modal.querySelector('.modal-content').innerHTML = `
            <div class="modal-title"><i class="fas fa-portrait"></i><span>上传${isPartner ? '对方': '我'}的头像</span></div>
            <div style="margin-bottom: 16px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button class="modal-btn modal-btn-secondary" id="upload-file-btn" style="flex: 1;">选择文件</button>
            <button class="modal-btn modal-btn-secondary" id="paste-url-btn" style="flex: 1;">粘贴URL</button>
            </div>
            <input type="file" class="modal-input" id="avatar-file-input" accept="image/*" style="display: none;">
            <input type="text" class="modal-input" id="avatar-url-input" placeholder="输入图片URL地址" style="display: none;">
            <div id="avatar-preview" style="text-align: center; margin-top: 10px; display: none;">
            <img id="preview-image" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid var(--border-color);">
            </div>
            </div>
            <div class="modal-buttons">
            <button class="modal-btn modal-btn-secondary" id="cancel-avatar">取消</button>
            <button class="modal-btn modal-btn-primary" id="save-avatar" disabled>保存</button>
            </div>
            `;

                showModal(modal.modal);

                const fileInput = document.getElementById('avatar-file-input');
                const urlInput = document.getElementById('avatar-url-input');
                const uploadBtn = document.getElementById('upload-file-btn');
                const pasteUrlBtn = document.getElementById('paste-url-btn');
                const previewDiv = document.getElementById('avatar-preview');
                const previewImg = document.getElementById('preview-image');
                const saveBtn = document.getElementById('save-avatar');
                const cancelBtn = document.getElementById('cancel-avatar');

                let currentAvatarData = null;


                uploadBtn.addEventListener('click', () => {
                    fileInput.click();
                    urlInput.style.display = 'none';
                    uploadBtn.classList.add('active');
                    pasteUrlBtn.classList.remove('active');
                });


                pasteUrlBtn.addEventListener('click', () => {
                    urlInput.style.display = 'block';
                    fileInput.style.display = 'none';
                    pasteUrlBtn.classList.add('active');
                    uploadBtn.classList.remove('active');
                    urlInput.focus();
                });



fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > MAX_AVATAR_SIZE) {
            showNotification('头像图片不能超过2MB', 'error');
            return;
        }

        showNotification('正在裁剪处理...', 'info', 1000);
        
        cropImageToSquare(file, 300).then(base64Data => {
            currentAvatarData = base64Data;
            previewImg.src = currentAvatarData;
            previewDiv.style.display = 'block';
            saveBtn.disabled = false;
        }).catch(err => {
            console.error(err);
            showNotification('图片处理失败', 'error');
        });
    }
});


                urlInput.addEventListener('input',
                    function() {
                        const url = urlInput.value.trim();
                        if (url) {

                            if (/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(url)) {
                                previewImg.src = url;
                                previewDiv.style.display = 'block';
                                currentAvatarData = url;
                                saveBtn.disabled = false;


                                const img = new Image();
                                img.onload = function() {

                                    previewImg.src = url;
                                };
                                img.onerror = function() {
                                    showNotification('图片URL无效或无法访问', 'error');
                                    saveBtn.disabled = true;
                                };
                                img.src = url;
                            } else {
                                saveBtn.disabled = true;
                            }
                        } else {
                            saveBtn.disabled = true;
                            previewDiv.style.display = 'none';
                        }
                    });


                saveBtn.addEventListener('click',
                    () => {
                        if (currentAvatarData) {
                            updateAvatar(isPartner ? DOMElements.partner.avatar: DOMElements.me.avatar, currentAvatarData);
                            throttledSaveData();
                            showNotification('头像已更新', 'success');
                            hideModal(modal.modal);
                        }
                    });


                cancelBtn.addEventListener('click',
                    () => {
                        hideModal(modal.modal);
                    });
            };

            DOMElements.partner.name.addEventListener('click', () => openNameModal(true));
            DOMElements.me.name.addEventListener('click', () => openNameModal(false));
            DOMElements.partner.avatar.addEventListener('click', () => openAvatarModal(true));
            DOMElements.me.avatar.addEventListener('click', () => openAvatarModal(false));

            DOMElements.me.statusContainer.addEventListener('click', () => {
                const statusTextElement = DOMElements.me.statusText; const statusContainer = DOMElements.me.statusContainer;
                if (statusContainer.querySelector('input')) return;
                const input = document.createElement('input'); input.type = 'text'; input.id = 'my-status-input'; input.value = statusTextElement.textContent;
                const saveStatus = () => {
                    const newStatus = input.value.trim();
                    if (newStatus) {
                        settings.myStatus = newStatus; showNotification('状态已更新', 'success');
                    } else {
                        settings.myStatus = "在线";
                    }
                    statusTextElement.textContent = settings.myStatus;
                    statusContainer.innerHTML = '';
                    statusContainer.appendChild(statusTextElement);
                    throttledSaveData();
                };
                input.addEventListener('blur', saveStatus);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') input.blur();
                });
                statusContainer.innerHTML = ''; statusContainer.appendChild(input); input.focus();
            });

            DOMElements.themeToggle.addEventListener('click', () => {
                settings.isDarkMode = !settings.isDarkMode; throttledSaveData(); updateUI(); showNotification(`已切换到${settings.isDarkMode ? '夜': '昼'}模式`,
                    'success');
            });
            DOMElements.settingsModal.settingsBtn.addEventListener('click', () => {
                showModal(DOMElements.settingsModal.modal);
            });
            DOMElements.favoritesModal.favoritesBtn.addEventListener('click', () => {
                showModal(document.getElementById('group-chat-modal'));
            });


document.getElementById('chat-settings').addEventListener('click', () => {
    hideModal(DOMElements.settingsModal.modal);
    
    const toggleSyncMap = {
        '#reply-toggle': { prop: 'replyEnabled', name: '引用回复' },
        '#sound-toggle': { prop: 'soundEnabled', name: '音效' },
        '#read-receipts-toggle': { prop: 'readReceiptsEnabled', name: '已读回执' },
        '#typing-indicator-toggle': { prop: 'typingIndicatorEnabled', name: '正在输入' },
        '#read-no-reply-toggle': { prop: 'allowReadNoReply', name: '已读不回' }
    };
    for (const [selector, { prop }] of Object.entries(toggleSyncMap)) {
        const el = document.querySelector(selector);
        if (el) el.classList.toggle('active', !!settings[prop]);
    }
    const svSlider = document.getElementById('sound-volume-slider');
    const svVal = document.getElementById('sound-volume-value');
    if (svSlider) { svSlider.value = Math.round((settings.soundVolume || 0.15) * 100); if (svVal) svVal.textContent = svSlider.value + '%'; }
    const csi = document.getElementById('custom-sound-url-input');
    if (csi) csi.value = settings.customSoundUrl || '';
    document.querySelectorAll('.time-fmt-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.fmt === (settings.timeFormat || 'HH:mm'));
    });
    const autoToggle = document.getElementById('auto-send-toggle');
    if (autoToggle) autoToggle.classList.toggle('active', !!settings.autoSendEnabled);
    updateAutoSendUI();
    updateDelayUI();
    const immToggle = document.getElementById('immersive-toggle');
    if (immToggle) immToggle.classList.toggle('active', document.body.classList.contains('immersive-mode'));
    
    showModal(DOMElements.chatModal.modal);
    setupAvatarFrameSettings();
});
            document.getElementById('advanced-settings').addEventListener('click', () => {
                hideModal(DOMElements.settingsModal.modal);
                showModal(DOMElements.advancedModal.modal);
            });

            document.getElementById('data-settings').addEventListener('click', () => {
                hideModal(DOMElements.settingsModal.modal);
                showModal(DOMElements.dataModal.modal);
            });


            document.querySelectorAll('.theme-color-btn').forEach(btn => {
                btn.addEventListener('click',
                    () => {
                        settings.colorTheme = btn.dataset.theme;
                        throttledSaveData();
                        updateUI();
                        showNotification(`主题颜色已切换`, 'success');
                    });
            });


            document.querySelectorAll('[data-bubble-style]').forEach(item => {
                item.addEventListener('click',
                    () => {
                        settings.bubbleStyle = item.dataset.bubbleStyle;
                        throttledSaveData();
                        updateUI();
                        showNotification(`气泡样式已切换为${getBubbleStyleName(settings.bubbleStyle)}`, 'success');
                    });
            });

            const fontUrlInput = document.getElementById('custom-font-url');
            const applyFontBtn = document.getElementById('apply-font-btn');
            
            if (fontUrlInput) fontUrlInput.value = settings.customFontUrl || "";

            if (applyFontBtn) {
                applyFontBtn.addEventListener('click', () => {
                    const url = fontUrlInput.value.trim();
                    settings.customFontUrl = url;
                    
                    showNotification('正在尝试加载字体...', 'info', 1000);
                    applyCustomFont(url).then(() => {
                        throttledSaveData();
                        if(url) showNotification('字体已应用', 'success');
                        else showNotification('已恢复默认字体', 'success');
                    });
                });
            }

            
            const followSystemBtn = document.getElementById('follow-system-font-btn');
            if (followSystemBtn) {
                followSystemBtn.addEventListener('click', () => {
                    
                    const systemFontStack = 'system-ui, -apple-system, sans-serif';
                    
                    
                    if (fontUrlInput) fontUrlInput.value = "";
                    
                    
                    settings.customFontUrl = "";
                    
                    
                    settings.messageFontFamily = systemFontStack;
                    
                    
                    document.documentElement.style.setProperty('--font-family', systemFontStack);
                    document.documentElement.style.setProperty('--message-font-family', systemFontStack);
                    
                    
                    throttledSaveData();
                    
                    
                    renderMessages(true);
                    
                    showNotification('已应用跟随系统字体', 'success');
                });
            }
            
            const cssTextarea = document.getElementById('custom-bubble-css');
            const applyCssBtn = document.getElementById('apply-css-btn');
            const resetCssBtn = document.getElementById('reset-css-btn');

            if (cssTextarea) cssTextarea.value = settings.customBubbleCss || "";

            function updateCssLivePreview() {
                const previewStyle = document.getElementById('css-live-preview-style');
                if (!previewStyle) return;
                const raw = (cssTextarea ? cssTextarea.value : '') || '';
                const scoped = raw.replace(/([^{}]+)\{/g, (match, selector) => {
                    const parts = selector.split(',').map(s => `#css-live-preview ${s.trim()}`);
                    return parts.join(', ') + ' {';
                });
                previewStyle.textContent = scoped;
            }

            if (cssTextarea) {
                cssTextarea.addEventListener('input', updateCssLivePreview);
                updateCssLivePreview();
            }

            if (applyCssBtn) {
                applyCssBtn.addEventListener('click', () => {
                    const css = cssTextarea.value;
                    settings.customBubbleCss = css;
                    applyCustomBubbleCss(css);
                    throttledSaveData();
                    showNotification('自定义样式已应用', 'success');
                });
            }

            if (resetCssBtn) {
                resetCssBtn.addEventListener('click', () => {
                    cssTextarea.value = "";
                    settings.customBubbleCss = "";
                    applyCustomBubbleCss("");
                    if (document.getElementById('css-live-preview-style')) document.getElementById('css-live-preview-style').textContent = '';
                    throttledSaveData();
                    showNotification('自定义样式已清除', 'success');
                });
            }

            const fontSizeSlider = document.getElementById('font-size-slider');
            const fontSizeValue = document.getElementById('font-size-value');

            fontSizeSlider.value = settings.fontSize;
            fontSizeValue.textContent = `${settings.fontSize}px`;

            fontSizeSlider.addEventListener('input', (e) => {
                settings.fontSize = parseInt(e.target.value);
                document.documentElement.style.setProperty('--font-size',
                    `${settings.fontSize}px`);
                fontSizeValue.textContent = `${settings.fontSize}px`;
            });

            fontSizeSlider.addEventListener('change', throttledSaveData);

            const avatarToggle = document.getElementById('in-chat-avatar-toggle-2');
            const avatarSizeControl = document.getElementById('in-chat-avatar-size-control-2');
            const avatarPositionControl = document.getElementById('in-chat-avatar-position-control-2');
            const avatarPreview = document.getElementById('avatar-bubble-preview');
            const avatarSizeSlider = document.getElementById('in-chat-avatar-size-slider-2');
            const avatarSizeValue = document.getElementById('in-chat-avatar-size-value-2');

            if (!settings.inChatAvatarPosition) settings.inChatAvatarPosition = 'center';

            function updateAvatarPreview() {
                if (!avatarPreview) return;
                const previewPartner = document.getElementById('preview-partner-avatar');
                const previewMe = document.getElementById('preview-my-avatar');
                const sz = `${settings.inChatAvatarSize}px`;
                if (previewPartner) {
                    previewPartner.style.width = sz;
                    previewPartner.style.height = sz;
                    const partnerImg = DOMElements.partner.avatar.querySelector('img');
                    if (partnerImg && partnerImg.src) {
                        previewPartner.innerHTML = `<img src="${partnerImg.src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    }
                }
                if (previewMe) {
                    previewMe.style.width = sz;
                    previewMe.style.height = sz;
                    const myImg = DOMElements.me.avatar.querySelector('img');
                    if (myImg && myImg.src) {
                        previewMe.innerHTML = `<img src="${myImg.src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    }
                }
                updateBubblePreview();
            }

            function updateBubblePreview() {
                const receivedBubble = document.getElementById('preview-bubble-received');
                const sentBubble = document.getElementById('preview-bubble-sent');
                if (!receivedBubble || !sentBubble) return;
                const style = settings.bubbleStyle || 'standard';
                const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-rgb').trim() || '100,150,255';
                const styleMap = {
                    'standard':      { recv: '16px 16px 16px 4px',  sent: '16px 16px 4px 16px',  recvShadow: '0 2px 10px rgba(0,0,0,0.08)', sentShadow: `0 3px 12px rgba(${accentRgb},0.22)` },
                    'rounded':       { recv: '18px 18px 18px 6px',  sent: '18px 18px 6px 18px',  recvShadow: '0 2px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)', sentShadow: `0 3px 12px rgba(${accentRgb},0.25), 0 1px 3px rgba(${accentRgb},0.1)` },
                    'rounded-large': { recv: '24px 24px 24px 4px',  sent: '24px 24px 4px 24px',  recvShadow: '0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)', sentShadow: `0 4px 16px rgba(${accentRgb},0.28), 0 2px 4px rgba(${accentRgb},0.12)` },
                    'square':        { recv: '4px 4px 4px 0',       sent: '4px 4px 0 4px',       recvShadow: '0 3px 10px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)', sentShadow: `0 3px 10px rgba(${accentRgb},0.2), 0 1px 2px rgba(${accentRgb},0.08)` }
                };
                const radii = styleMap[style] || styleMap['standard'];
                receivedBubble.style.borderRadius = radii.recv;
                receivedBubble.style.boxShadow = radii.recvShadow;
                sentBubble.style.borderRadius = radii.sent;
                sentBubble.style.boxShadow = radii.sentShadow;
                const recvBg = getComputedStyle(document.documentElement).getPropertyValue('--message-received-bg').trim();
                const recvText = getComputedStyle(document.documentElement).getPropertyValue('--message-received-text').trim();
                const sentBg = getComputedStyle(document.documentElement).getPropertyValue('--message-sent-bg').trim();
                const sentText = getComputedStyle(document.documentElement).getPropertyValue('--message-sent-text').trim();
                if (recvBg) receivedBubble.style.background = recvBg;
                if (recvText) receivedBubble.style.color = recvText;
                if (sentBg) sentBubble.style.background = sentBg;
                if (sentText) sentBubble.style.color = sentText;
                receivedBubble.style.fontFamily = settings.messageFontFamily || '';
                sentBubble.style.fontFamily = settings.messageFontFamily || '';
                receivedBubble.style.fontSize = (settings.fontSize || 16) + 'px';
                sentBubble.style.fontSize = (settings.fontSize || 16) + 'px';
                const customCss = (document.getElementById('custom-bubble-css') || {}).value || '';
                let previewStyle = document.getElementById('bubble-preview-custom-style');
                if (!previewStyle) {
                    previewStyle = document.createElement('style');
                    previewStyle.id = 'bubble-preview-custom-style';
                    document.head.appendChild(previewStyle);
                }
                previewStyle.textContent = customCss;
            }

            function updateAvatarSettingsUI() {
                const enabled = settings.inChatAvatarEnabled;
                const pill = document.getElementById('avatar-toggle-pill-2');
                const knob = document.getElementById('avatar-toggle-knob-2');
                const statusText = document.getElementById('avatar-toggle-status-2');
                if (pill) pill.style.background = enabled ? 'var(--accent-color)' : 'var(--border-color)';
                if (knob) knob.style.right = enabled ? '3px' : '23px';
                if (statusText) statusText.textContent = enabled ? '已开启 — 消息旁显示头像' : '已关闭';

                if (avatarSizeControl) avatarSizeControl.style.display = enabled ? 'flex' : 'none';
                if (avatarPositionControl) avatarPositionControl.style.display = enabled ? 'block' : 'none';
                if (avatarPreview) avatarPreview.style.display = enabled ? 'block' : 'none';

                if (avatarSizeSlider) avatarSizeSlider.value = settings.inChatAvatarSize;
                if (avatarSizeValue) avatarSizeValue.textContent = `${settings.inChatAvatarSize}px`;
                document.documentElement.style.setProperty('--in-chat-avatar-size', `${settings.inChatAvatarSize}px`);

                const pos = settings.inChatAvatarPosition || 'center';
                const alignMap = { 'top': 'flex-start', 'center': 'center', 'bottom': 'flex-end' };
                document.documentElement.style.setProperty('--avatar-align', alignMap[pos] || 'flex-start');
                document.querySelectorAll('.preview-msg-row').forEach(row => {
                    row.style.alignItems = alignMap[pos] || 'flex-start';
                });
                const topBtn = document.getElementById('avatar-pos-top-2');
                const centerBtn = document.getElementById('avatar-pos-center-2');
                const bottomBtn = document.getElementById('avatar-pos-bottom-2');
                [topBtn, centerBtn, bottomBtn].forEach(btn => {
                    if (!btn) return;
                    btn.className = btn.dataset.pos === pos ? 'modal-btn modal-btn-primary' : 'modal-btn modal-btn-secondary';
                    btn.style.flex = '1'; btn.style.fontSize = '12px'; btn.style.padding = '7px 0';
                });

                updateAvatarPreview();
            }
            updateAvatarSettingsUI();

            if (avatarToggle) {
                avatarToggle.addEventListener('click', () => {
                    settings.inChatAvatarEnabled = !settings.inChatAvatarEnabled;
                    updateAvatarSettingsUI();
                    renderMessages(true);
                    throttledSaveData();
                });
            }

            if (avatarSizeSlider) {
                avatarSizeSlider.addEventListener('input', (e) => {
                    settings.inChatAvatarSize = parseInt(e.target.value, 10);
                    updateAvatarSettingsUI();
                    renderMessages(true); 
                });
                avatarSizeSlider.addEventListener('change', throttledSaveData);
            }

            ['avatar-pos-top-2','avatar-pos-center-2','avatar-pos-bottom-2'].forEach(btnId => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.addEventListener('click', () => {
                        settings.inChatAvatarPosition = btn.dataset.pos;
                        updateAvatarSettingsUI();
                        renderMessages(true);
                        throttledSaveData();
                    });
                }
            });

            document.querySelectorAll('[data-bubble-style]').forEach(item => {
                item.addEventListener('click', () => {
                    setTimeout(updateBubblePreview, 100);
                });
            });
            
            const minDelaySlider = document.getElementById('reply-delay-min-slider');
            const minDelayValue = document.getElementById('reply-delay-min-value');
            const maxDelaySlider = document.getElementById('reply-delay-max-slider');
            const maxDelayValue = document.getElementById('reply-delay-max-value');

            function updateDelayUI() {
                minDelaySlider.value = settings.replyDelayMin;
                const minSec = settings.replyDelayMin / 1000;
                minDelayValue.textContent = minSec >= 60 ? `${(minSec/60).toFixed(1)}分钟` : `${minSec.toFixed(0)}s`;
                maxDelaySlider.value = settings.replyDelayMax;
                const maxSec = settings.replyDelayMax / 1000;
                maxDelayValue.textContent = maxSec >= 60 ? `${(maxSec/60).toFixed(1)}分钟` : `${maxSec.toFixed(0)}s`;
                maxDelaySlider.min = settings.replyDelayMin; 
            }
            updateDelayUI();

            minDelaySlider.addEventListener('input', (e) => {
                settings.replyDelayMin = parseInt(e.target.value, 10);
                if (settings.replyDelayMin > settings.replyDelayMax) {
                    settings.replyDelayMax = settings.replyDelayMin;
                }
                updateDelayUI();
            });
            minDelaySlider.addEventListener('change', throttledSaveData);

            maxDelaySlider.addEventListener('input', (e) => {
                settings.replyDelayMax = parseInt(e.target.value, 10);
                 if (settings.replyDelayMax < settings.replyDelayMin) {
                    settings.replyDelayMin = settings.replyDelayMax;
                }
                updateDelayUI();
            });
            maxDelaySlider.addEventListener('change', throttledSaveData);

            const settingToggles = {
                '#reply-toggle': {
                    prop: 'replyEnabled', name: '引用回复'
                },
                '#sound-toggle': {
                    prop: 'soundEnabled', name: '音效'
                },
                '#read-receipts-toggle': {
                    prop: 'readReceiptsEnabled', name: '已读回执'
                },
                '#typing-indicator-toggle': {
                    prop: 'typingIndicatorEnabled', name: '正在输入'},
                    '#read-no-reply-toggle': { prop: 'allowReadNoReply', name: '已读不回' }
};

            for (const [selector, {
                prop, name
            }] of Object.entries(settingToggles)) {
                const element = document.querySelector(selector);
                if (!element) continue;

                element.classList.toggle('active', !!settings[prop]);

                element.addEventListener('click', () => {
                    settings[prop] = !settings[prop];
                    throttledSaveData();
                    updateUI();
                    element.classList.toggle('active', !!settings[prop]);
                    if (prop !== 'soundEnabled') renderMessages(true);
                    showNotification(`${name}已${settings[prop] ? '开启': '关闭'}`, 'success');
                });
            }

            const soundVolSlider = document.getElementById('sound-volume-slider');
            const soundVolVal = document.getElementById('sound-volume-value');
            if (soundVolSlider) {
                soundVolSlider.value = Math.round((settings.soundVolume || 0.15) * 100);
                if (soundVolVal) soundVolVal.textContent = soundVolSlider.value + '%';
                soundVolSlider.addEventListener('input', (e) => {
                    settings.soundVolume = parseInt(e.target.value) / 100;
                    if (soundVolVal) soundVolVal.textContent = e.target.value + '%';
                });
                soundVolSlider.addEventListener('change', throttledSaveData);
            }
            const customSoundInput = document.getElementById('custom-sound-url-input');
            if (customSoundInput) {
                customSoundInput.value = settings.customSoundUrl || '';
                customSoundInput.addEventListener('change', () => {
                    settings.customSoundUrl = customSoundInput.value.trim();
                    throttledSaveData();
                });
            }
            const testSoundBtn = document.getElementById('test-sound-btn');
            if (testSoundBtn) {
                testSoundBtn.addEventListener('click', () => { playSound('message'); });
            }
            document.querySelectorAll('.time-fmt-opt').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.fmt === (settings.timeFormat || 'HH:mm'));
                opt.addEventListener('click', () => {
                    document.querySelectorAll('.time-fmt-opt').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    settings.timeFormat = opt.dataset.fmt;
                    throttledSaveData();
                    renderMessages(true);
                    showNotification('时间格式已更新', 'success');
                });
            });


            document.getElementById('appearance-settings').addEventListener('click', () => {
                hideModal(DOMElements.settingsModal.modal);
                window.hideAppearancePanel && window.hideAppearancePanel();
                renderBackgroundGallery();
                renderThemeSchemesList();
                
                const fontSizeSliderEl = document.getElementById('font-size-slider');
                const fontSizeValueEl = document.getElementById('font-size-value');
                if (fontSizeSliderEl) {
                    fontSizeSliderEl.value = settings.fontSize;
                    if (fontSizeValueEl) fontSizeValueEl.textContent = `${settings.fontSize}px`;
                }
                const fontUrlInputEl = document.getElementById('custom-font-url');
                if (fontUrlInputEl) fontUrlInputEl.value = settings.customFontUrl || '';
                const cssTextareaEl = document.getElementById('custom-bubble-css');
                if (cssTextareaEl) cssTextareaEl.value = settings.customBubbleCss || '';
                
                document.querySelectorAll('[data-bubble-style]').forEach(item => {
                    item.classList.toggle('active', item.dataset.bubbleStyle === settings.bubbleStyle);
                });
                
                document.querySelectorAll('.theme-color-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.theme === settings.colorTheme);
                });
                
                showModal(DOMElements.appearanceModal.modal);
                setTimeout(() => { 
                    updateAvatarSettingsUI && updateAvatarSettingsUI(); 
                    setupAppearancePanelFrameSettings && setupAppearancePanelFrameSettings();
                }, 100);
            });
            DOMElements.appearanceModal.closeBtn.addEventListener('click', () => {
                    hideModal(DOMElements.appearanceModal.modal);
                });

            const bgInput = document.getElementById('bg-gallery-input');
            if (bgInput) {
                bgInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                        showNotification('背景图片不能超过10MB', 'error');
                        return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('文件较大，正在处理中...', 'info', 2000);
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        savedBackgrounds.push({
                            id: `user-${Date.now()}`,
                            type: file.type === 'image/gif' ? 'gif' : 'image',
                            value: base64
                        });
                        saveBackgroundGallery();
                        renderBackgroundGallery();
                        applyBackground(base64);
                        localforage.setItem(getStorageKey('chatBackground'), base64);
                        showNotification('新背景已添加并应用', 'success');
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                });
            }

const autoSendToggle = document.getElementById('auto-send-toggle');
const autoSendControl = document.getElementById('auto-send-control');
const autoSendSlider = document.getElementById('auto-send-slider');
const autoSendValue = document.getElementById('auto-send-value');

const updateAutoSendUI = () => {
    autoSendToggle.classList.toggle('active', !!settings.autoSendEnabled);
    autoSendControl.style.display = settings.autoSendEnabled ? "flex" : "none";
    const currentVal = settings.autoSendInterval || 5;
    autoSendSlider.value = currentVal;
    autoSendValue.textContent = `${currentVal}分钟`;
};

updateAutoSendUI();

autoSendToggle.addEventListener('click', () => {
    settings.autoSendEnabled = !settings.autoSendEnabled;
    updateAutoSendUI();
    manageAutoSendTimer(); 
    throttledSaveData();
    showNotification(`主动发送已${settings.autoSendEnabled ? '开启' : '关闭'}`, 'success');
});

autoSendSlider.value = settings.autoSendInterval || 5;
autoSendValue.textContent = `${settings.autoSendInterval || 5}分钟`;

autoSendSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    settings.autoSendInterval = val;
    autoSendValue.textContent = `${val}分钟`;
});

autoSendSlider.addEventListener('change', () => {
    manageAutoSendTimer(); 
    throttledSaveData();
});

            const resetBgBtn = document.getElementById('reset-default-bg');
            if (resetBgBtn) {
                resetBgBtn.addEventListener('click', () => {
                    removeBackground();
                    renderBackgroundGallery();
                    showNotification('已移除背景图', 'success');
                });
            }
        }


        function initNewFeatureListeners() {
            const flEntry = document.getElementById('fortune-lenormand-function');
            if (flEntry) {
                flEntry.addEventListener('click', () => {
                    hideModal(DOMElements.advancedModal.modal);
                    generateFortune();
                    switchFLTab('fortune');
                    showModal(document.getElementById('fortune-lenormand-modal'));
                });
            }

            document.getElementById('close-lenormand').addEventListener('click', () => {
                hideModal(document.getElementById('fortune-lenormand-modal'));
            });
    const envelopeEntryBtn = document.getElementById('envelope-function');
    if (envelopeEntryBtn) {
        envelopeEntryBtn.addEventListener('click', async () => {
            hideModal(DOMElements.advancedModal.modal);
            await loadEnvelopeData();
            await checkEnvelopeStatus();
            currentEnvTab = 'outbox';
            document.getElementById('env-tab-outbox').classList.add('active');
            document.getElementById('env-tab-inbox').classList.remove('active');
            document.getElementById('env-outbox-section').style.display = 'block';
            document.getElementById('env-inbox-section').style.display = 'none';
            document.getElementById('env-compose-form').style.display = 'none';
            document.getElementById('env-main-close-btn').style.display = 'flex';
            renderEnvelopeLists();
            showModal(document.getElementById('envelope-modal'));
        });
    }
document.getElementById('send-envelope').addEventListener('click', handleSendEnvelope);

document.getElementById('cancel-envelope').addEventListener('click', () => {
    hideModal(document.getElementById('envelope-modal'));
});
            const shareFortuneBtnEl = document.getElementById('share-fortune');
            if (shareFortuneBtnEl) {
                shareFortuneBtnEl.addEventListener('click', () => {
                    const fortuneDescEl = document.querySelector('.fortune-desc');
                    if (!fortuneDescEl) return;
                    const fortuneText = fortuneDescEl.textContent;
                    const shareText = `我的今日运势：${fortuneText}`;

                    if (navigator.share) {
                        navigator.share({
                            title: '今日运势',
                            text: shareText
                        });
                    } else {
                        navigator.clipboard.writeText(shareText).then(() => {
                            showNotification('运势已复制到剪贴板', 'success');
                        });
                    }
                });
            }

            const closeFortune = document.getElementById('close-fortune');
            if (closeFortune) {
                closeFortune.addEventListener('click', () => {
                    hideModal(document.getElementById('fortune-lenormand-modal'));
                });
            }


            document.getElementById('batch-favorite-function').addEventListener('click', () => {
                hideModal(DOMElements.favoritesModal.modal);
                toggleBatchFavoriteMode();
            });

            initReplyLibraryListeners();


            
            DOMElements.anniversaryAnimation.closeBtn.addEventListener('click', () => {
                DOMElements.anniversaryAnimation.modal.classList.remove('active');
            });


            document.getElementById('stats-function').addEventListener('click', () => {
                hideModal(DOMElements.advancedModal.modal);
                renderStatsContent();
                showModal(DOMElements.statsModal.modal);
            });

            const coinFunctionBtn = document.getElementById('coin-function');
            if (coinFunctionBtn) {
                coinFunctionBtn.addEventListener('click', () => {
                    hideModal(DOMElements.advancedModal.modal);
                    handleCoinToss();
                });
            }
            const musicToggle = document.getElementById('music-player-toggle');
            musicToggle.addEventListener('click', () => {
                settings.musicPlayerEnabled = !settings.musicPlayerEnabled;
                throttledSaveData();

                const player = document.getElementById('player');
                if (settings.musicPlayerEnabled) {
                    player.classList.add('visible');
                    showNotification('音乐播放器已开启', 'success');
                } else {
                    player.classList.remove('visible');
                    document.getElementById('playlist').classList.remove('active');
                    const audio = document.getElementById('audio');
                    if (audio) audio.pause();
                    showNotification('音乐播放器已关闭', 'info');
                }
                hideModal(DOMElements.advancedModal.modal);
            });
        }
    const annToggleBtn = document.getElementById('ann-toggle-btn');
    const annFormWrapper = document.getElementById('ann-form-wrapper');

    if (annToggleBtn && annFormWrapper) {
        annToggleBtn.addEventListener('click', () => {
            const isActive = annFormWrapper.classList.contains('active');
            
            if (isActive) {
                annFormWrapper.classList.remove('active');
                annToggleBtn.classList.remove('active');
            } else {
                annFormWrapper.classList.add('active');
                annToggleBtn.classList.add('active');
                
                setTimeout(() => {
                    annFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    }

        function getBubbleStyleName(style) {
            const names = {
                'standard': '标准',
                'rounded': '圆角',
                'rounded-large': '大圆角',
                'square': '方形'
            };
            return names[style] || '标准';
        }

        function initDataManagementListeners() {

            document.getElementById('export-chat').addEventListener('click', exportChatHistory);
            document.getElementById('import-chat').addEventListener('click', () => DOMElements.importInput.click());
            DOMElements.importInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    importChatHistory(e.target.files[0]); e.target.value = '';
                }
            });

            document.getElementById('clear-storage').addEventListener('click', clearAllAppData);
            const creditsBtn = document.getElementById('open-credits-btn');
            if (creditsBtn) {
                creditsBtn.addEventListener('click', () => {

                    hideModal(DOMElements.dataModal.modal);


                    const disclaimerModal = document.getElementById('disclaimer-modal');


                    if (disclaimerModal) {
                        showModal(disclaimerModal);
                    }
                });
            }

        }


        DOMElements.sessionModal.managerBtn.addEventListener('click', () => {
            renderSessionList(); showModal(DOMElements.sessionModal.modal);
        });
        DOMElements.sessionModal.createBtn.addEventListener('click', () => {
            const newId = createNewSession(false);

            renderSessionList();
            showNotification('新会话已创建', 'success');
        });

        DOMElements.sessionModal.list.addEventListener('click', (e) => {
            const item = e.target.closest('.session-item');
            if (!item) return;
            const sessionId = item.dataset.id;

            if (e.target.closest('.rename')) {
                const session = sessionList.find(s => s.id === sessionId);
                const newName = prompt('输入新的会话名称:', session.name);
                if (newName && newName.trim()) {
                    session.name = newName.trim();
                    localforage.setItem(`${APP_PREFIX}sessionList`, sessionList); 
                    renderSessionList();
                    showNotification('会话已重命名', 'success');
                }
            } else if (e.target.closest('.delete')) {
                if (sessionList.length <= 1) {
                    showNotification('无法删除最后一个会话', 'warning');
                    return;
                }
                if (confirm('确定要删除此会话及其所有聊天记录吗？此操作不可恢复')) {

                    const currentSessionId = SESSION_ID;

                    sessionList = sessionList.filter(s => s.id !== sessionId);
localforage.setItem(`${APP_PREFIX}sessionList`, sessionList);

Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`${APP_PREFIX}${sessionId}_`)) safeRemoveItem(key);
});

if (sessionId === currentSessionId) {
    const newCurrentId = sessionList[0].id;
    localforage.setItem(`${APP_PREFIX}customThemes`, customThemes);
    window.location.hash = newCurrentId;
    window.location.reload();
} else {
    renderSessionList();
    showNotification('会话已删除', 'success');
}
                }
            } else {

                if (sessionId !== SESSION_ID) {
                    if (confirm('切换会话将刷新页面，确定要继续吗？')) {
                        window.location.hash = sessionId;
                        window.location.reload();
                    }
                }
            }
        });

        const initMusicPlayer = () => {
    const latestSystemSongs = [{
                title: "虚拟", sub: "你是我朝夕相伴触手可及的虚拟", url: "https://files.catbox.moe/6s65mp.mp3"
            },
                {
                    title: "多远都要在一起", sub: "爱能克服远距离", url: "https://files.catbox.moe/06k9ra.mp3"
                },
                {
                    title: "永不失联的爱", sub: "这一辈子都不想失联的爱", url: "https://files.catbox.moe/uvucav.mp3"
                },
                {
                    title: "稳稳的幸福", sub: "这是我想要的幸福", url: "https://files.catbox.moe/inb22a.mp3"
                },
                {
                    title: "有我呢", sub: "我会让你习惯 多一个人陪伴", url: "https://files.catbox.moe/hrazjt"
                },
                {
                    title: "一千零一夜", sub: "梦里能到达的地方啊 有一天脚步也能到达", url: "https://files.catbox.moe/syfuon.mp3"
                },
                {
                    title: "月亮与六便士", sub: "我的世界由你建立 因你崩塌", url: "https://files.catbox.moe/98quqc.mp3"
                },
                {
                    title: "次元恋人", sub: "约好了隔着次元也吻住泪眼", url: "https://files.catbox.moe/5u5dy0.mp3"
                },
                {
                    title: "阳光下的星星", sub: "如果爱上你只是一个梦境", url: "https://files.catbox.moe/dxgqsk.mp3"
                },
                {
                    title: "周边", sub: "灵魂里空缺的那段", url: "https://files.catbox.moe/a7k5wd.mp3"
                },
                {
                    title: "恋爱ing", sub: "让我重新认识L O V E", url: "https://files.catbox.moe/94slcd.mp3"
                },
                {
                    title: "一点一滴", sub: "你让爱一点一滴汇成河", url: "https://files.catbox.moe/958qzg.mp3"
                },
                {
                    title: "关键词", sub: "让我见识爱情可以慷慨又自私", url: "https://files.catbox.moe/9yl5ic.mp3"
                },
                {
                    title: "想见你想见你想见你", sub: "穿越了千个万个时间线里人海里相依", url: "https://files.catbox.moe/co58d7.mp3"
                },
                {
                    title: "star crossing night", sub: "这里没有你", url: "https://files.catbox.moe/i3f86b.mp3"
                },
                {
                    title: "sea temple", sub: "If we have each other", url: "https://files.catbox.moe/c57gxs.mp3"
                },
                {
                    title: "我想要占据你", sub: "占据你的⼀切且无可厚非", url: "https://files.catbox.moe/1fp6eg.mp3"
                },
                {
                    title: "特别的人", sub: "我们是对方特别的人", url: "https://files.catbox.moe/a0n0l7.mp3"
                },
                {
                    title: "麦恩莉", sub: "在广阔寂寞漩涡解脱", url: "https://files.catbox.moe/2inae2.mp3"
                },
                {
                    title: "会呼吸的痛", sub: "想念是会呼吸的痛", url: "https://files.catbox.moe/0uhmxr.mp3"
                },
                {
                    title: "一生的爱", sub: "我只想要给你我一生的爱", url: "https://files.catbox.moe/f0e93c.mp3"
                },
                {
                    title: "身骑白马", sub: "追赶要我爱的不保留", url: "https://files.catbox.moe/iywfe2.mp3"
                },
                {
                    title: "爱情讯息", sub: "想念变成空气在叹息", url: "https://files.catbox.moe/4dl0t2.mp3"
                },
                {
                    title: "你在 不在", sub: "你在我心里面 陪我失眠", url: "https://files.catbox.moe/povyqa.mp3"
                },
                {
                    title: "你是我的风景", sub: "爱让悬崖变平地", url: "https://files.catbox.moe/fnwtf8.mp3"
                },
                {
                    title: "life with u", sub: "Now I know that you're the one", url: "https://files.catbox.moe/zqfxvd.mp3"
                },
                {
                    title: "勾指起誓", sub: "你是理所当然的奇迹", url: "https://files.catbox.moe/4spgo5.mp3"
                },
                {
                    title: "牵一半", sub: "你的存在是我唯一依赖", url: "https://files.catbox.moe/bk21gu.mp3"
                },
                {
                    title: "rove", sub: "Oh we are in the War of Love on Rove", url: "https://files.catbox.moe/sfwsuk.mp3"
                },
                {
                    title: "唯一", sub: "我真的爱你 句句不轻易", url: "https://files.catbox.moe/69g4fe.mp3"
                },
            { title: "致爱 Your Song", sub: "我只想每个落日 身边都有你", url: "https://files.catbox.moe/01bmnf.mp3" },
            { title: "一首想不通的古风", sub: "画地为牢 画命为符 铸成下一世坚守", url: "https://files.catbox.moe/9b4lh7.mp3" },
            { title: "茉莉雨", sub: "琴声里愁几许关于你", url: "https://files.catbox.moe/7ml83u.mp3" },
            { title: "怎么唱情歌", sub: "海 变的苦涩 灼伤一片温柔", url: "https://files.catbox.moe/isqax9.mp3" },
            { title: "岸边客", sub: "你回来我心未改 你不在我还等待", url: "https://files.catbox.moe/9oud6s.mp3" },
            { title: "江南雪", sub: "相思再无药解 从此万般风月都是我心结", url: "https://files.catbox.moe/hhjwek.mp3" },
            { title: "不死之身", sub: "我仍爱你爱得不知天高地厚", url: "https://files.catbox.moe/g960ev.mp3" },
            { title: "我们的明天", sub: "爱从不曾保留 才勇敢了我", url: "https://files.catbox.moe/a3yjvv.mp3" },
            { title: "难解", sub: "点炷高香敬予神明 被人嘲笑矢志不渝", url: "https://files.catbox.moe/1u8m3r.mp3" },
            { title: "最好的我 & 50 Feet", sub: "试着伸手 却连你的影子我都无法靠近", url: "https://files.catbox.moe/clsiyi.mp3" },
            { title: "同手同脚", sub: "也是存在在这个世界 唯一的唯一", url: "https://files.catbox.moe/b8hss3.mp3" },
            { title: "同花顺", sub: "只要肯爱得深 是不是就有这可能", url: "https://files.catbox.moe/28mw5d.mp3" },
            { title: "轻舞", sub: "轻舞吧 过往如裙纱", url: "https://files.catbox.moe/8n9lhi.mp3" },
            { title: "绝对占有 相对自由", sub: "赞美你包容你都是我的使命", url: "https://files.catbox.moe/zi4gxo.mp3" },
            { title: "千万次想象", sub: "我千万次想象 千万次模仿 思念的形状", url: "https://files.catbox.moe/4jtex8.mp3" },
            { title: "辞家千里", sub: "穿过无人问津去见山海万顷", url: "https://files.catbox.moe/2quy44.mp3" },
            { title: "Ryukyuvania", sub: "----", url: "https://files.catbox.moe/utmbqp.mp3" },
            { title: "沦陷", sub: "圈它在黑暗中逃不出的梦魇", url: "https://files.catbox.moe/0bhl3i.mp3" },
            { title: "晚枫歌", sub: "你又怎知我从未放手", url: "https://files.catbox.moe/xhwrwy.mp3" },
            { title: "I Need U", sub: "I need you girl", url: "https://files.catbox.moe/v1k4h8.mp3" },
            { title: "若梦", sub: "日升月落 此生依旧难舍", url: "https://files.catbox.moe/6uysqy.mp3" },
            { title: "爱人", sub: "可是恨的人没死成 爱的人没可能", url: "https://files.catbox.moe/wtbdxe.mp3" },
            { title: "星河叹", sub: "我盼孤身纵马 笛声漫天 四海任我游", url: "https://files.catbox.moe/de7g2m.mp3" },
            { title: "爱殇", sub: "假欢畅 又何妨 无人共享", url: "https://files.catbox.moe/or2hm7.mp3" },
            { title: "Una mattina", sub: "----", url: "https://files.catbox.moe/nf8o90.mp3" },
            { title: "顺其自然", sub: "You light up my heart", url: "https://files.catbox.moe/na01cn.mp3" },
            { title: "初见", sub: "若如初见 为谁而归", url: "https://files.catbox.moe/bumolx.mp3" },
            { title: "我好像在哪见过你", sub: "人们把难言的爱都埋入土壤里", url: "https://files.catbox.moe/vcidpc.mp3" },
            { title: "别回头", sub: "爱是年少时不堪其重 渗透灵魂的一阵剧痛", url: "https://files.catbox.moe/h1hwo5.mp3" },
            { title: "大鱼", sub: "怕你飞远去 怕你离我而去", url: "https://files.catbox.moe/jlcvkg.mp3" },
            { title: "人鱼的眼泪", sub: "Baby Don't cry", url: "https://files.catbox.moe/40fm4j.mp3" },
            { title: "九张机", sub: "我愿化作望断天涯那一方青石", url: "https://files.catbox.moe/hql6w5.mp3" },
            { title: "梦幻诛仙", sub: "来世若再会还与你双双对对", url: "https://files.catbox.moe/r6btwp.mp3" },
            { title: "寻常歌", sub: "所幸不过是 寻常人间事", url: "https://files.catbox.moe/ntcqvr.mp3" },
{ title: "公示情书", sub: "有种微妙确定的幸福 叫对方正在输入", url: "https://files.catbox.moe/rptwer.mp3" },
{ title: "现在那边是几点", sub: "请问你现在那边是几点 会不会还放有我的照片", url: "https://files.catbox.moe/icv2aa.mp3" },
{ title: "情人", sub: "气氛开始升温 危险又迷人", url: "https://files.catbox.moe/iqairg.mp3" },
{ title: "怜悯", sub: "我要带着爱意着恨你", url: "https://files.catbox.moe/242a1h.mp3" },
{ title: "疑心病", sub: "你终于说出口你对我感情也很重", url: "https://files.catbox.moe/jc1umm.mp3" },
{ title: "诀爱", sub: "若灵魂相结在天地之间", url: "https://files.catbox.moe/quqaws.mp3" },
{ title: "彼岸", sub: "她捧起镜花水月 一刹那湮灭", url: "https://files.catbox.moe/zxepep.mp3" },
{ title: "问情", sub: "当爱恨如潮生多残忍", url: "https://files.catbox.moe/erds0n.mp3" },
{ title: "同进退", sub: "我会牵着你手同进退 佛前立誓不后悔", url: "https://files.catbox.moe/vb6chf.mp3" },
{ title: "招摇", sub: "一句此生不换", url: "https://files.catbox.moe/oc86ih.mp3" },
{ title: "你要的全拿走", sub: "好聚好散听着也楚楚可怜", url: "https://files.catbox.moe/ok2e3s.mp3" },
{ title: "云裳羽衣曲", sub: "故事鲜艳而缘分却太浅", url: "https://files.catbox.moe/njnbhv.mp3" },
{ title: "大梦归离", sub: "终于听风儿说 知道你在哪里", url: "https://files.catbox.moe/5z67vs.mp3" },
{ title: "偏向", sub: "为何会两败俱伤", url: "https://files.catbox.moe/i37f39.mp3" },
{ title: "Love me like you do", sub: "You're the only thing I wanna touch", url: "https://files.catbox.moe/arym0i.mp3" },
{ title: "Not snow,but U", sub: "我期待的不是雪而是有你的冬天", url: "https://files.catbox.moe/6rk4gw.mp3" },
{ title: "The Evergreen", sub: "我恍然明了我所需的一切已尽数摆在眼前", url: "https://files.catbox.moe/ca3rim.mp3" },
{ title: "冥河螺旋", sub: "我如此希望 我伴你左右", url: "https://files.catbox.moe/xtj8db.mp3" },
{ title: "熄灭", sub: "你总问我在一起会不会感到厌倦", url: "https://files.catbox.moe/wnzxou.mp3" },
{ title: "爱人错过", sub: "我肯定在几百年前就说过爱你", url: "https://files.catbox.moe/q2nx16.mp3" },
{ title: "我想念", sub: "我想念你说过的那种永远", url: "https://files.catbox.moe/3qxads.mp3" },
{ title: "此生不换", sub: "再有一万年深情也不变", url: "https://files.catbox.moe/72ik88.mp3" },
{ title: "鳥の詩", sub: "----", url: "https://files.catbox.moe/966u00.mp3" }

    ];

    const uploadCoverBtn = document.getElementById('upload-cover-btn');
    const coverInput = document.getElementById('cover-input');
    const vinylRecord = document.getElementById('vinyl-record-visual');

    const applyPlayerCover = (base64Data) => {
        if (base64Data) {
            vinylRecord.style.backgroundImage = `url(${base64Data})`;
            vinylRecord.classList.add('has-cover');
            vinylRecord.style.borderWidth = '1px';
        } else {
            vinylRecord.style.backgroundImage = '';
            vinylRecord.classList.remove('has-cover');
            vinylRecord.style.borderWidth = '2px';
        }
    };

const savedCover = safeGetItem(APP_PREFIX + 'playerCover');

    localforage.getItem(APP_PREFIX + 'playerCover').then(cover => { if(cover) applyPlayerCover(cover); });
    if (savedCover) applyPlayerCover(savedCover);

    uploadCoverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (vinylRecord.classList.contains('has-cover')) {
            if (confirm('想要重置回默认的【主题色黑胶】样式吗？\n\n• 点击【确定】恢复默认\n• 点击【取消】选择新图片')) {
                localforage.removeItem(APP_PREFIX + 'playerCover');
                applyPlayerCover(null);
                showNotification('已恢复默认黑胶样式', 'success');
                return;
            }
        }
        coverInput.click();
    });

    coverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showNotification('图片太大了，请上传 2MB 以内的图片', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Data = event.target.result;
            try {
                localforage.setItem(APP_PREFIX + 'playerCover', base64Data);
                applyPlayerCover(base64Data);
                showNotification('专辑封面设置成功！', 'success');
            } catch (err) {
                console.error(err);
                showNotification('图片存储失败（可能超出了浏览器限制）', 'error');
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    const savedSongsStr = safeGetItem(APP_PREFIX + 'customSongs');
    let songs = [];
if (savedSongsStr) {
        songs = JSON.parse(savedSongsStr);
    } else {
        songs = [...latestSystemSongs];
    }

    const player = document.getElementById('player');
    const miniView = document.getElementById('mini-view');
    const playlist = document.getElementById('playlist');
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('play-btn');
    const progressArea = document.getElementById('progress-area');

    const addSongModal = document.getElementById('add-song-modal');
    const newSongTitle = document.getElementById('new-song-title');
    const newSongSub = document.getElementById('new-song-sub');
    const newSongUrl = document.getElementById('new-song-url');
    const confirmAddSongBtn = document.getElementById('confirm-add-song');
    const cancelAddSongBtn = document.getElementById('cancel-add-song');
    const modalTitleElem = addSongModal.querySelector('.modal-title span');

    let currentIndex = 0;
    let isPlaying = false;
    let isRandom = false;
    let editModeIndex = -1;
    let searchTerm = '';
    let isSearchVisible = false;

    function loadSong(index) {
        if (songs.length === 0) return;
        if (index >= songs.length) index = 0;
        if (index < 0) index = songs.length - 1;

        const song = songs[index];
        document.getElementById('music-title').innerText = song.title;
        document.getElementById('music-subtitle').innerText = song.sub;
        
        if (song.url) audio.src = song.url;
        updatePlaylistHighlight();
    }

    function togglePlay() {
        if (songs.length === 0) {
            showNotification('播放列表为空', 'warning');
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            document.getElementById('icon-play').style.display = 'block';
            document.getElementById('icon-pause').style.display = 'none';
            player.classList.remove('playing');
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    document.getElementById('icon-play').style.display = 'none';
                    document.getElementById('icon-pause').style.display = 'block';
                    player.classList.add('playing');
                }).catch(error => {
                    console.error(error);
                    showNotification('播放失败，请挂vpn，具体方法自行', 'error');
                });
            }
        }
    }

    function nextSong() {
        if (songs.length === 0) return;
        if (isRandom) currentIndex = Math.floor(Math.random() * songs.length);
        else currentIndex = (currentIndex + 1) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) audio.play();
    }

    function prevSong() {
        if (songs.length === 0) return;
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) audio.play();
    }

    function savePlaylist() {
        localforage.setItem(APP_PREFIX + 'customSongs', songs);
        renderPlaylist();
    }

    function syncSystemSongs() {
        if (confirm('更新歌单将会：\n1. 读取代码中最新的预设歌单\n2. 保留你手动添加的自定义歌曲\n\n确定要更新吗？')) {
            try {
                const userCustomSongs = songs.filter(s => s.isCustom === true);
                
                songs = [...latestSystemSongs, ...userCustomSongs];
                
                safeSetItem(APP_PREFIX + 'customSongs', JSON.stringify(songs));
                
                currentIndex = 0;
                loadSong(0);
                if (isPlaying) {
                    audio.pause();
                    audio.currentTime = 0;
                    isPlaying = false;
                    document.getElementById('icon-play').style.display = 'block';
                    document.getElementById('icon-pause').style.display = 'none';
                    player.classList.remove('playing');
                }

                renderPlaylist();
                
                showNotification('歌单已成功更新！', 'success');
            } catch (e) {
                console.error(e);
                showNotification('更新失败，请检查代码格式', 'error');
            }
        }
    }

    function openEditModal(index) {
        const song = songs[index];
        if (!song) return;
        editModeIndex = index;
        newSongTitle.value = song.title;
        newSongSub.value = song.sub;
        newSongUrl.value = song.url;
        modalTitleElem.innerText = "编辑歌曲信息";
        confirmAddSongBtn.innerText = "保存修改";
        showModal(addSongModal);
    }

    function openAddModal() {
        editModeIndex = -1;
        newSongTitle.value = '';
        newSongSub.value = '';
        newSongUrl.value = '';
        modalTitleElem.innerText = "添加自定义歌曲";
        confirmAddSongBtn.innerText = "添加播放";
        showModal(addSongModal);
    }

    function renderPlaylist() {
        playlist.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'playlist-header';
        header.innerHTML = `
            <div class="pl-header-title">˙°ʚᕱ⑅ᕱɞ°˙</div>
            <div class="pl-header-actions">
                <button class="pl-icon-btn ${isSearchVisible ? 'active' : ''}" id="pl-search-toggle" title="搜索"><i class="fas fa-search"></i></button>
                <button class="pl-icon-btn" id="pl-sync-btn" title="更新预设歌单"><i class="fas fa-sync-alt"></i></button>
                <button class="pl-icon-btn" id="pl-add-btn" title="添加歌曲"><i class="fas fa-plus"></i></button>
            </div>
        `;
        playlist.appendChild(header);

        const searchWrapper = document.createElement('div');
        searchWrapper.className = `playlist-search-wrapper ${isSearchVisible ? 'active' : ''}`;
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'playlist-search-input';
        searchInput.placeholder = '';
        searchInput.value = searchTerm;
        
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            renderListContent(contentDiv);
        });
        
        searchWrapper.appendChild(searchInput);
        playlist.appendChild(searchWrapper);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'playlist-content';
        playlist.appendChild(contentDiv);

        renderListContent(contentDiv);

        header.querySelector('#pl-add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openAddModal();
            newSongTitle.focus();
        });
        
        header.querySelector('#pl-sync-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            syncSystemSongs();
        });

        header.querySelector('#pl-search-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            isSearchVisible = !isSearchVisible;
            searchWrapper.classList.toggle('active', isSearchVisible);
            e.currentTarget.classList.toggle('active', isSearchVisible);
            if (isSearchVisible) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    function renderListContent(container) {
        container.innerHTML = '';
        
        const filteredSongs = songs.map((s, i) => ({...s, originalIndex: i}))
                                   .filter(s => s.title.toLowerCase().includes(searchTerm) || 
                                                s.sub.toLowerCase().includes(searchTerm));

        if (filteredSongs.length === 0) {
            container.innerHTML = `<div class="empty-search-result">未找到 "${searchTerm}" 相关歌曲</div>`;
            return;
        }

        filteredSongs.forEach((song) => {
            const realIndex = song.originalIndex;

            const div = document.createElement('div');
            div.className = 'playlist-item';
            if (realIndex === currentIndex) div.classList.add('playing');

            const highlightText = (text, term) => {
                if (!term) return text;
                const regex = new RegExp(`(${term})`, 'gi');
                return text.replace(regex, '<span class="highlight">$1</span>');
            };

            const displayTitle = highlightText(song.title, searchTerm);
            const displaySub = highlightText(song.sub, searchTerm);

            div.innerHTML = `
                <div class="song-info">
                    <div class="song-title-row">${displayTitle}</div>
                    <div class="song-sub-row">${displaySub}</div>
                </div>
                <div class="item-actions">
                    ${song.isCustom ? '<span class="custom-tag" title="自定义歌曲"></span>' : ''}
                    <span class="action-icon-btn delete" title="移除">&times;</span>
                </div>
            `;

            if (song.isCustom) {
                div.querySelector('.custom-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditModal(realIndex);
                });
            }

            div.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定移除《${song.title}》吗？`)) {
                    songs.splice(realIndex, 1);
                    savePlaylist();
                    
                    if (realIndex === currentIndex) {
                        if (songs.length > 0) {
                            currentIndex = realIndex % songs.length;
                            loadSong(currentIndex);
                            if (isPlaying) audio.play();
                        } else {
                            audio.pause();
                            isPlaying = false;
                            loadSong(0);
                        }
                    } else if (realIndex < currentIndex) {
                        currentIndex--;
                    }
                }
            });

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = realIndex;
                loadSong(currentIndex);
                if (!isPlaying) togglePlay();
                else audio.play();
            });

            container.appendChild(div);
        });
    }

    function updatePlaylistHighlight() {
        const contentDiv = playlist.querySelector('.playlist-content');
        if (contentDiv) renderListContent(contentDiv);
    }

    confirmAddSongBtn.addEventListener('click', () => {
        const title = newSongTitle.value.trim();
        const sub = newSongSub.value.trim();
        const url = newSongUrl.value.trim();

        if (!title || !url) {
            showNotification('歌名和链接不能为空', 'error');
            return;
        }

        const songData = {
            title,
            sub: sub || '未知艺术家',
            url,
            isCustom: true
        };

        if (editModeIndex >= 0) {
            songs[editModeIndex] = songData;
            showNotification('歌曲信息已修改', 'success');
        } else {
            songs.unshift(songData);
            showNotification('歌曲已添加', 'success');
            if (songs.length === 1) loadSong(0);
        }

        searchTerm = '';
        savePlaylist();
        newSongTitle.value = '';
        newSongSub.value = '';
        newSongUrl.value = '';
        hideModal(addSongModal);
    });

    cancelAddSongBtn.addEventListener('click', () => {
        hideModal(addSongModal);
    });

    function setupDrag() {
        let isDragging = false, startX, startY, initialLeft, initialTop, hasMoved = false;
        const dragStart = (e) => {
            if (e.target.closest('.btn') || e.target.closest('.progress-wrapper') || e.target.closest('.playlist-popup')) return;
            const event = e.type === 'touchstart' ? e.touches[0] : e;
            isDragging = true; hasMoved = false;
            startX = event.clientX; startY = event.clientY;
            const rect = player.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            player.style.transition = 'none';
            playlist.style.transition = 'none';
        };
        const dragMove = (e) => {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();
            const event = e.type === 'touchmove' ? e.touches[0] : e;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            const maxLeft = window.innerWidth - player.offsetWidth;
            const maxTop = window.innerHeight - player.offsetHeight;
            player.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            player.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
            const rect = player.getBoundingClientRect();
            playlist.style.left = rect.left + 'px';
playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 65 : 155)) + 'px';
};
        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            player.style.transition = '';
            playlist.style.transition = '';
        };
        player.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        player.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);

        miniView.addEventListener('click', () => {
            if (!hasMoved && player.classList.contains('collapsed')) {
                player.classList.remove('collapsed');
                setTimeout(() => {
                    const rect = player.getBoundingClientRect();
                    playlist.style.top = (rect.top + 150) + 'px';
                }, 300);
            }
        });
    }

    playBtn.addEventListener('click', togglePlay);
    document.getElementById('next-btn').addEventListener('click', nextSong);
    document.getElementById('prev-btn').addEventListener('click', prevSong);
    document.getElementById('minimize-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        player.classList.add('collapsed');
        playlist.classList.remove('active');
    });

    progressArea.addEventListener('click', (e) => {
        const width = progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) audio.currentTime = (clickX / width) * duration;
    });

    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.target;
        if (duration) document.getElementById('progress-bar').style.width = `${(currentTime / duration) * 100}%`;
    });
    audio.addEventListener('ended', nextSong);

    document.getElementById('mode-btn').addEventListener('click', () => {
        isRandom = !isRandom;
        document.getElementById('icon-loop').style.display = isRandom ? 'none' : 'block';
        document.getElementById('icon-shuffle').style.display = isRandom ? 'block' : 'none';
        showNotification(isRandom ? '随机播放' : '顺序播放', 'info', 1000);
    });

    const listBtn = document.getElementById('list-btn');
    listBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = player.getBoundingClientRect();
        playlist.style.left = rect.left + 'px';
        playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 62 : 150)) + 'px';
        playlist.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!playlist.contains(e.target) && !listBtn.contains(e.target) && !player.contains(e.target) && !e.target.closest('#add-song-modal')) {
            playlist.classList.remove('active');
        }
    });

    loadSong(0);
    renderPlaylist();
    setupDrag();

    if (settings.musicPlayerEnabled) {
        player.classList.add('visible');
    }
};

        const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];



function renderReplyLibrary() {
    const list = document.getElementById('custom-replies-list');
    const searchInput = document.getElementById('reply-search-input');
    const addButton = document.getElementById('add-custom-reply');
    const subTabsContainer = document.getElementById('cr-sub-tabs');
    const titleEl = document.getElementById('cr-modal-title');

    const currentConfig = LIBRARY_CONFIG[currentMajorTab];
    titleEl.textContent = currentConfig.title;

    subTabsContainer.innerHTML = currentConfig.tabs.map(tab => `
        <button class="reply-tab-btn ${currentSubTab === tab.id ? 'active' : ''}" 
                data-id="${tab.id}" data-mode="${tab.mode}">
            ${tab.name}
        </button>
    `).join('');

    subTabsContainer.querySelectorAll('.reply-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSubTab = btn.dataset.id;
            renderReplyLibrary();
        });
    });

    list.innerHTML = '';
    list.className = 'content-list-area'; 
    
    const activeTabConfig = currentConfig.tabs.find(t => t.id === currentSubTab);
    list.classList.add(activeTabConfig.mode + '-mode');

    const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let itemsToRender = [];
    let renderType = 'text'; 
    if (currentMajorTab === 'reply') {
        if (currentSubTab === 'custom') {
            itemsToRender = customReplies;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增回复';
            addButton.style.display = 'flex';
        } else if (currentSubTab === 'default') {
            itemsToRender = CONSTANTS.REPLY_MESSAGES;
            addButton.style.display = 'none';
        } else if (currentSubTab === 'emojis') {
            itemsToRender = CONSTANTS.REPLY_EMOJIS;
            renderType = 'emoji';
            addButton.style.display = 'none';
        } else if (currentSubTab === 'stickers') {
            itemsToRender = stickerLibrary;
            renderType = 'image';
            addButton.innerHTML = '<i class="fas fa-plus"></i> 添加表情';
            addButton.style.display = 'flex';
        }
    } else if (currentMajorTab === 'atmosphere') {
        addButton.style.display = 'flex';
        if (currentSubTab === 'pokes') {
            itemsToRender = customPokes;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增拍一拍';
        } else if (currentSubTab === 'statuses') {
            itemsToRender = customStatuses;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增状态';
        } else if (currentSubTab === 'mottos') {
            itemsToRender = customMottos;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增格言';
        } else if (currentSubTab === 'intros') {
            itemsToRender = customIntros;
            addButton.innerHTML = '<i class="fas fa-plus"></i> 新增开场语';
        }
    }

    if (itemsToRender.length === 0) {
        list.innerHTML = renderEmptyState("列表空空如也");
        return;
    }

    itemsToRender.forEach((item, index) => {
        if (renderType === 'text' && filterText && !item.toLowerCase().includes(filterText)) return;
        
        if (renderType === 'image') {
            const div = document.createElement('div');
            div.className = 'sticker-item';
            div.innerHTML = `
                <img src="${item}" loading="lazy">
                <div class="sticker-delete-btn"><i class="fas fa-times"></i></div>
            `;
            div.querySelector('.sticker-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm("删除此表情？")) {
                    stickerLibrary.splice(index, 1);
                    throttledSaveData();
                    renderReplyLibrary();
                }
            });
            list.appendChild(div);
            return;
        }

        if (renderType === 'emoji') {
            const isDisabled = disabledDefaultReplies.includes(item);
            const div = document.createElement('div');
            div.className = `emoji-item ${isDisabled ? 'disabled' : ''}`;
            div.textContent = item;
            div.onclick = () => {
                toggleEmoji(item);
            };
            list.appendChild(div);
            return;
        }

        const isDefaultReply = (currentMajorTab === 'reply' && currentSubTab === 'default');
        const isDisabled = isDefaultReply && disabledDefaultReplies.includes(item);
        
        const div = document.createElement('div');
        div.className = `custom-reply-item ${isDisabled ? 'disabled' : ''}`;
        
        let displayHTML = `<span class="custom-reply-text">${item.replace('|', '<br><small style="opacity:0.7">')}</span>`; 

        let buttonsHTML = '';
        if (isDefaultReply) {
             const icon = isDisabled ? 'fa-eye' : 'fa-eye-slash';
             buttonsHTML = `
                <button class="reply-action-mini copy-btn" title="复制为自定义"><i class="fas fa-copy"></i></button>
                <button class="reply-action-mini toggle-btn"><i class="fas ${icon}"></i></button>
             `;
        } else {
            buttonsHTML = `
                <button class="reply-action-mini edit-btn"><i class="fas fa-pen"></i></button>
                <button class="reply-action-mini delete-btn"><i class="fas fa-trash-alt"></i></button>
            `;
        }

        div.innerHTML = `${displayHTML}<div class="custom-reply-actions">${buttonsHTML}</div>`;

        if (isDefaultReply) {
            div.querySelector('.toggle-btn').onclick = () => toggleDefaultReply(item);
            div.querySelector('.copy-btn').onclick = () => copyToCustom(item);
        } else {
            div.querySelector('.delete-btn').onclick = () => deleteItem(index);
            div.querySelector('.edit-btn').onclick = () => editItem(index, item);
        }

        list.appendChild(div);
    });
}
function toggleEmoji(emoji) {
    const idx = disabledDefaultReplies.indexOf(emoji);
    if (idx > -1) disabledDefaultReplies.splice(idx, 1);
    else disabledDefaultReplies.push(emoji);
    throttledSaveData();
    renderReplyLibrary();
}

function toggleDefaultReply(text) {
    const idx = disabledDefaultReplies.indexOf(text);
    if (idx > -1) disabledDefaultReplies.splice(idx, 1);
    else disabledDefaultReplies.push(text);
    throttledSaveData();
    renderReplyLibrary();
}

function copyToCustom(text) {
    customReplies.push(text);
    currentSubTab = 'custom';
    throttledSaveData();
    renderReplyLibrary();
    showNotification('已复制到自定义回复', 'success');
}

function deleteItem(index) {
    if (!confirm("确定删除吗？")) return;
    
    if (currentMajorTab === 'reply' && currentSubTab === 'custom') customReplies.splice(index, 1);
    else if (currentSubTab === 'pokes') customPokes.splice(index, 1);
    else if (currentSubTab === 'statuses') customStatuses.splice(index, 1);
    else if (currentSubTab === 'mottos') customMottos.splice(index, 1);
    else if (currentSubTab === 'intros') customIntros.splice(index, 1);

    throttledSaveData();
    renderReplyLibrary();
}

function editItem(index, oldText) {
    let newText;
    if (currentSubTab === 'intros') {
        const parts = oldText.split('|');
        const l1 = prompt("修改主标题:", parts[0]);
        if(l1 === null) return;
        const l2 = prompt("修改副标题:", parts[1] || "");
        if(l2 === null) return;
        newText = `${l1}|${l2}`;
    } else {
        newText = prompt("修改内容:", oldText);
    }

    if (newText === null || newText.trim() === "") return;

    if (currentMajorTab === 'reply' && currentSubTab === 'custom') customReplies[index] = newText;
    else if (currentSubTab === 'pokes') customPokes[index] = newText;
    else if (currentSubTab === 'statuses') customStatuses[index] = newText;
    else if (currentSubTab === 'mottos') customMottos[index] = newText;
    else if (currentSubTab === 'intros') customIntros[index] = newText;

    throttledSaveData();
    renderReplyLibrary();
}
function renderEmptyState(text) {
    return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--text-secondary); opacity: 0.6; grid-column: 1 / -1;">
        <div style="width: 60px; height: 60px; background: var(--secondary-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: var(--shadow);">
            <i class="fas fa-search" style="font-size: 24px; color: var(--accent-color);"></i>
        </div>
        <p style="font-size:15px; font-weight: 500; text-align:center; line-height:1.5;">${text}</p>
    </div>`;
}

function initReplyLibraryListeners() {
    const entryBtn = document.getElementById('custom-replies-function');
    if (entryBtn) {
        entryBtn.addEventListener('click', () => {
            hideModal(DOMElements.advancedModal.modal);
            currentMajorTab = 'reply';
            currentSubTab = 'custom';
            document.querySelectorAll('.sidebar-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.major === 'reply');
            });
            renderReplyLibrary();
            showModal(DOMElements.customRepliesModal.modal);
        });
    }

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentMajorTab = btn.dataset.major;

            if (currentMajorTab === 'announcement') {
                return;
            }

            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            var toolbar = document.getElementById('cr-toolbar');
            var subTabs = document.getElementById('cr-sub-tabs');
            var addBtn = document.getElementById('add-custom-reply');
            var titleEl = document.getElementById('cr-modal-title');
            if (listArea) listArea.style.display = '';
            if (annPanel) annPanel.style.display = 'none';
            if (toolbar) toolbar.style.display = '';
            if (subTabs) subTabs.style.display = '';
            if (addBtn) addBtn.style.display = '';
            if (titleEl) titleEl.textContent = '内容管理';
            
            currentSubTab = LIBRARY_CONFIG[currentMajorTab].tabs[0].id;
            
            renderReplyLibrary();
        });
    });

    const searchInput = document.getElementById('reply-search-input');
    if (searchInput) searchInput.addEventListener('input', renderReplyLibrary);

    const exportBtn = document.getElementById('export-replies-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const libraryData = {
                customReplies,
                customPokes,
                customStatuses,
                customMottos,
                customIntros,
                disabledDefaultReplies, 
                exportDate: new Date().toISOString()
            };
            const fileName = `reply-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
            const dataStr = JSON.stringify(libraryData, null, 2);
            exportDataToMobileOrPC(dataStr, fileName);
            showNotification('已导出（表情包因文件过大已排除，请单独管理）', 'info', 4000);
        });
    }

    const importBtn = document.getElementById('import-replies-btn');
    const importInput = document.getElementById('import-replies-input');
    
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    const choice = confirm('选择导入方式：\n\n点击【确定】= 覆盖（替换当前内容）\n点击【取消】= 追加（保留现有内容并合并）');
                    
                    let count = 0;
                    if (choice) {
                        if (data.customReplies) { customReplies = data.customReplies; count++; }
                        if (data.customPokes) { customPokes = data.customPokes; count++; }
                        if (data.customStatuses) { customStatuses = data.customStatuses; count++; }
                        if (data.customMottos) { customMottos = data.customMottos; count++; }
                        if (data.customIntros) { customIntros = data.customIntros; count++; }
                        if (data.stickerLibrary) { stickerLibrary = data.stickerLibrary; count++; }
                        if (data.disabledDefaultReplies) { disabledDefaultReplies = data.disabledDefaultReplies; count++; }
                    } else {
                        if (data.customReplies) { customReplies = [...new Set([...customReplies, ...data.customReplies])]; count++; }
                        if (data.customPokes) { customPokes = [...new Set([...customPokes, ...data.customPokes])]; count++; }
                        if (data.customStatuses) { customStatuses = [...new Set([...customStatuses, ...data.customStatuses])]; count++; }
                        if (data.customMottos) { customMottos = [...new Set([...customMottos, ...data.customMottos])]; count++; }
                        if (data.customIntros) { customIntros = [...new Set([...customIntros, ...data.customIntros])]; count++; }
                        if (data.stickerLibrary) { stickerLibrary = [...new Set([...stickerLibrary, ...data.stickerLibrary])]; count++; }
                        if (data.disabledDefaultReplies) { 
                            disabledDefaultReplies = [...new Set([...disabledDefaultReplies, ...data.disabledDefaultReplies])]; 
                            count++; 
                        }
                    }
                    
                    throttledSaveData();
                    renderReplyLibrary();
                    showNotification(choice ? '覆盖导入成功！' : '追加导入成功！', 'success');
                } catch (err) {
                    console.error(err);
                    showNotification('文件格式错误', 'error');
                }
            };
            reader.readAsText(file);
            e.target.value = ''; 
        });
    }
    const addBtn = document.getElementById('add-custom-reply');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (currentSubTab === 'stickers') {
                document.getElementById('sticker-file-input').click();
                return;
            }

            let input;
            if (currentSubTab === 'intros') {
                 const l1 = prompt("请输入主标题 (如: 𝑳𝒐𝒗𝒆):");
                 if(!l1) return;
                 const l2 = prompt("请输入副标题 (如: 若要由我来谈论爱的话):");
                 input = `${l1}|${l2}`;
            } else {
                 input = prompt(`请输入新的${getCategoryName(currentSubTab)}:`);
            }

            if (input && input.trim()) {
                if (currentSubTab === 'custom') customReplies.unshift(input);
                else if (currentSubTab === 'pokes') customPokes.unshift(input);
                else if (currentSubTab === 'statuses') customStatuses.unshift(input);
                else if (currentSubTab === 'mottos') customMottos.unshift(input);
                else if (currentSubTab === 'intros') customIntros.unshift(input);
                
                throttledSaveData();
                renderReplyLibrary();
                showNotification('添加成功', 'success');
            }
        });
    }
}
function getCategoryName(tabId) {
    const map = {
        'custom': '回复', 'pokes': '拍一拍', 'statuses': '状态', 
        'mottos': '格言', 'intros': '开场语'
    };
    return map[tabId] || '内容';
}
        function updateTabUI() {
            document.querySelectorAll('.reply-tab-btn').forEach(btn => {
                if (btn.dataset.tab === currentReplyTab) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            const searchInput = document.getElementById('reply-search-input');
            if (searchInput) searchInput.value = '';
        }


        function initRippleFeedback() {

            const rippleTargets = [
                '.input-btn',
                '.action-btn',
                '.modal-btn',
                '.settings-item',
                '.batch-action-btn',
                '.coin-btn-action',
                '.import-export-btn',
                '.reply-tab-btn',
                '.anniversary-type-btn',
                '.reply-tool-btn',
                '.session-action-btn',
                '.fav-action-btn'
            ];


            document.addEventListener('mousedown', function(e) {

                const target = e.target.closest(rippleTargets.join(','));

                if (target) {
                    createRipple(e, target);
                }
            });

            function createRipple(event, button) {

                if (!button.classList.contains('ripple-effect')) {
                    button.classList.add('ripple-effect');
                }


                const circle = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;


                const rect = button.getBoundingClientRect();


                const clientX = event.clientX || (event.touches ? event.touches[0].clientX: 0);
                const clientY = event.clientY || (event.touches ? event.touches[0].clientY: 0);

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${clientX - rect.left - radius}px`;
                circle.style.top = `${clientY - rect.top - radius}px`;
                circle.classList.add('ripple-wave');


                const ripple = button.getElementsByClassName('ripple-wave')[0];
                if (ripple) {
                    ripple.remove();
                }


                button.appendChild(circle);


                setTimeout(() => {
                    circle.remove();
                }, 600);
            }
        }
        function applyAvatarFrame(avatarContainer, frameSettings) {
            let frameElement = avatarContainer.querySelector('.avatar-frame');
            
            if (frameSettings && frameSettings.src) {
                if (!frameElement) {
                    frameElement = document.createElement('img');
                    frameElement.className = 'avatar-frame';
                    avatarContainer.appendChild(frameElement);
                }
                frameElement.src = frameSettings.src;
                frameElement.style.width = `${frameSettings.size || 100}%`;
                frameElement.style.height = `${frameSettings.size || 100}%`;
                
                const offsetX = frameSettings.offsetX || 0;
                const offsetY = frameSettings.offsetY || 0;
                frameElement.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
            } else {
                if (frameElement) {
                    frameElement.remove();
                }
            }
        }

        function setupAvatarFrameSettings() {
            const setupControlsFor = (type) => {
                const preview = document.getElementById(`${type}-frame-preview`);
                const uploadBtn = document.getElementById(`${type}-frame-upload-btn`);
                const removeBtn = document.getElementById(`${type}-frame-remove-btn`);
                const fileInput = document.getElementById(`${type}-frame-file-input`);
                const sizeSlider = document.getElementById(`${type}-frame-size`);
                const sizeValue = document.getElementById(`${type}-frame-size-value`);
                const xSlider = document.getElementById(`${type}-frame-offset-x`);
                const xValue = document.getElementById(`${type}-frame-offset-x-value`);
                const ySlider = document.getElementById(`${type}-frame-offset-y`);
                const yValue = document.getElementById(`${type}-frame-offset-y-value`);
                
                if (!preview || !uploadBtn || !sizeSlider) return;

                const settingsKey = type === 'my' ? 'myAvatarFrame' : 'partnerAvatarFrame';
                const avatarContainer = type === 'my' ? DOMElements.me.avatarContainer : DOMElements.partner.avatarContainer;
                const avatarElement = type === 'my' ? DOMElements.me.avatar : DOMElements.partner.avatar;


const updatePreview = () => {
    let avatarContent = avatarElement.innerHTML;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = avatarContent;
    const img = tempDiv.querySelector('img');
    if (img) {
        avatarContent = `<img src="${img.src}" alt="preview">`;
    }

    const frameSettings = settings[settingsKey];

    let frameHtml = '';
    if (frameSettings && frameSettings.src) {
        const size = frameSettings.size || 100;
        const offsetX = frameSettings.offsetX || 0;
        const offsetY = frameSettings.offsetY || 0;
        
        frameHtml = `<img src="${frameSettings.src}" class="preview-frame" 
            style="width: ${size}%; height: ${size}%; transform: translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px));">`;
    }

    preview.innerHTML = `
        <div class="preview-bg-layer">
            ${avatarContent}
        </div>
        ${frameHtml}
    `;
};
                
                const updateControls = () => {
                    const frame = settings[settingsKey];
                    sizeSlider.value = frame?.size || 100;
                    sizeValue.textContent = `${sizeSlider.value}%`;
                    xSlider.value = frame?.offsetX || 0;
                    xValue.textContent = `${xSlider.value}px`;
                    ySlider.value = frame?.offsetY || 0;
                    yValue.textContent = `${ySlider.value}px`;
                    updatePreview();
                };
                
                uploadBtn.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024) {
                        showNotification('头像框图片大小不能超过1MB', 'error');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (!settings[settingsKey]) {
                            settings[settingsKey] = { size: 100, offsetX: 0, offsetY: 0 };
                        }
                        settings[settingsKey].src = event.target.result;
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls();
                        throttledSaveData();
                    };
                    reader.readAsDataURL(file);
                });
                
                removeBtn.addEventListener('click', () => {
                    settings[settingsKey] = null;
                    applyAvatarFrame(avatarContainer, null);
                    updateControls();
                    throttledSaveData();
                });

                [sizeSlider, xSlider, ySlider].forEach(slider => {
                    slider.addEventListener('input', () => {
                        if (!settings[settingsKey]) return;
                        settings[settingsKey].size = parseInt(sizeSlider.value);
                        settings[settingsKey].offsetX = parseInt(xSlider.value);
                        settings[settingsKey].offsetY = parseInt(ySlider.value);
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls();
                        renderMessages(true); 
                    });
                     slider.addEventListener('change', throttledSaveData);
                });

                updateControls();
            };
            
            setupControlsFor('my');
            setupControlsFor('partner');
        }

        function applyAllAvatarFrames() {
            applyAvatarFrame(DOMElements.me.avatarContainer, settings.myAvatarFrame);
            applyAvatarFrame(DOMElements.partner.avatarContainer, settings.partnerAvatarFrame);
            applyAvatarShapeToDOM('my', settings.myAvatarShape || 'circle');
            applyAvatarShapeToDOM('partner', settings.partnerAvatarShape || 'circle');
        }

        function applyAvatarShapeToDOM(type, shape) {
            const SHAPES = ['circle','square','pentagon','heart'];
            const avatarContainer = type === 'my' ? DOMElements.me.avatarContainer : DOMElements.partner.avatarContainer;
            if (!avatarContainer) return;
            SHAPES.forEach(s => avatarContainer.classList.remove('avatar-shape-' + s));
            if (shape && shape !== 'none') avatarContainer.classList.add('avatar-shape-' + shape);
            document.querySelectorAll('.message-avatar').forEach(el => {
                SHAPES.forEach(s => el.classList.remove('shape-' + s));
            });
        }

        function setupAppearancePanelFrameSettings() {
            const setupFor = (type) => {
                const suffix = '-2';
                const preview = document.getElementById(`${type}-frame-preview${suffix}`);
                const uploadBtn = document.getElementById(`${type}-frame-upload-btn${suffix}`);
                const removeBtn = document.getElementById(`${type}-frame-remove-btn${suffix}`);
                const fileInput = document.getElementById(`${type}-frame-file-input${suffix}`);
                const sizeSlider = document.getElementById(`${type}-frame-size${suffix}`);
                const sizeValue = document.getElementById(`${type}-frame-size-value${suffix}`);
                const xSlider = document.getElementById(`${type}-frame-offset-x${suffix}`);
                const xValue = document.getElementById(`${type}-frame-offset-x-value${suffix}`);
                const ySlider = document.getElementById(`${type}-frame-offset-y${suffix}`);
                const yValue = document.getElementById(`${type}-frame-offset-y-value${suffix}`);
                if (!preview || !uploadBtn) return;

                const settingsKey = type === 'my' ? 'myAvatarFrame' : 'partnerAvatarFrame';
                const avatarContainer = type === 'my' ? DOMElements.me.avatarContainer : DOMElements.partner.avatarContainer;
                const avatarElement = type === 'my' ? DOMElements.me.avatar : DOMElements.partner.avatar;

                const updatePreview2 = () => {
                    let avatarContent = avatarElement.innerHTML;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = avatarContent;
                    const img = tempDiv.querySelector('img');
                    if (img) avatarContent = `<img src="${img.src}" alt="preview">`;
                    const frameSettings = settings[settingsKey];
                    let frameHtml = '';
                    if (frameSettings && frameSettings.src) {
                        const size = frameSettings.size || 100;
                        const ox = frameSettings.offsetX || 0;
                        const oy = frameSettings.offsetY || 0;
                        frameHtml = `<img src="${frameSettings.src}" class="preview-frame" style="width:${size}%;height:${size}%;transform:translate(calc(-50% + ${ox}px),calc(-50% + ${oy}px));">`;
                    }
                    preview.innerHTML = `<div class="preview-bg-layer">${avatarContent}</div>${frameHtml}`;
                };

                const updateControls2 = () => {
                    const frame = settings[settingsKey];
                    if (sizeSlider) { sizeSlider.value = frame?.size || 100; sizeValue.textContent = `${sizeSlider.value}%`; }
                    if (xSlider) { xSlider.value = frame?.offsetX || 0; xValue.textContent = `${xSlider.value}px`; }
                    if (ySlider) { ySlider.value = frame?.offsetY || 0; yValue.textContent = `${ySlider.value}px`; }
                    updatePreview2();
                };

                uploadBtn.addEventListener('click', () => fileInput && fileInput.click());
                if (fileInput) fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    if (file.size > 1024 * 1024) { showNotification('图片大小不能超过1MB', 'error'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (!settings[settingsKey]) settings[settingsKey] = { size: 100, offsetX: 0, offsetY: 0 };
                        settings[settingsKey].src = ev.target.result;
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls2(); throttledSaveData();
                    };
                    reader.readAsDataURL(file);
                });
                if (removeBtn) removeBtn.addEventListener('click', () => {
                    settings[settingsKey] = null;
                    applyAvatarFrame(avatarContainer, null);
                    updateControls2(); throttledSaveData();
                });
                [sizeSlider, xSlider, ySlider].forEach(s => {
                    if (!s) return;
                    s.addEventListener('input', () => {
                        if (!settings[settingsKey]) return;
                        settings[settingsKey].size = parseInt(sizeSlider.value);
                        settings[settingsKey].offsetX = parseInt(xSlider.value);
                        settings[settingsKey].offsetY = parseInt(ySlider.value);
                        applyAvatarFrame(avatarContainer, settings[settingsKey]);
                        updateControls2(); renderMessages(true);
                    });
                    s.addEventListener('change', throttledSaveData);
                });
                updateControls2();
            };
            setupFor('my');
            setupFor('partner');
        }
        const themeColorMappings = {
            '--primary-bg': '主背景色',
            '--secondary-bg': '卡片 / 弹窗背景',
            '--header-bg': '顶栏背景',
            '--input-area-bg': '输入区背景',
            '--text-primary': '主要文字',
            '--text-secondary': '次要文字 / 占位符',
            '--border-color': '边框 / 分割线',
            '--accent-color': '主强调色（按钮 / 图标）',
            '--accent-color-dark': '强调色深色变体',
            '--message-sent-bg': '我方气泡背景',
            '--message-sent-text': '我方气泡文字',
            '--message-received-bg': '对方气泡背景',
            '--message-received-text': '对方气泡文字',
            '--favorite-color': '收藏星标颜色',
        };

        const themeExtraMappings = {
            '--radius': { label: '圆角半径', type: 'range', min: 0, max: 32, unit: 'px', default: '16px' },
            '--message-font-weight': { label: '消息粗细', type: 'select', options: ['300','400','500','600','700'], default: '400' },
            '--message-line-height': { label: '消息行高', type: 'range', min: 1.0, max: 2.5, step: 0.05, unit: '', default: '1.5' },
        };


function initThemeEditor() {
    const openEditorBtn = document.getElementById('open-theme-editor');
    
    if (openEditorBtn) {
        const newBtn = openEditorBtn.cloneNode(true);
        openEditorBtn.parentNode.replaceChild(newBtn, openEditorBtn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("自定义主题编辑器按钮被点击！");
            
            const appearanceModal = document.getElementById('appearance-modal');
            const editorModal = document.getElementById('theme-editor-modal');

            if (appearanceModal) hideModal(appearanceModal);
            
            populateThemeEditor();
            populateThemeSelector();
            
            if (editorModal) showModal(editorModal);
        });
    }

    const closeBtn = document.getElementById('close-theme-editor');
    if (closeBtn) {
        closeBtn.onclick = () => {
            updateUI();
            hideModal(document.getElementById('theme-editor-modal'));
        };
    }
    
    const applyCloseBtn = document.getElementById('apply-close-theme-editor');
    if (applyCloseBtn) {
        applyCloseBtn.onclick = () => {
            const root = document.documentElement;
            const customColors = {};
            for (const variable of Object.keys(themeColorMappings)) {
                const val = root.style.getPropertyValue(variable);
                if (val) customColors[variable] = val.trim();
            }
            for (const variable of Object.keys(themeExtraMappings)) {
                const val = root.style.getPropertyValue(variable);
                if (val) customColors[variable] = val.trim();
            }
            settings.customThemeColors = customColors;
            throttledSaveData && throttledSaveData();
            updateUI();
            hideModal(document.getElementById('theme-editor-modal'));
            showNotification('主题已应用', 'success');
        };
    }
    
    const saveBtn = document.getElementById('save-theme-preset-btn');
    if(saveBtn) saveBtn.onclick = saveCurrentThemeAsPreset;

    const overwriteBtn = document.getElementById('overwrite-theme-preset-btn');
    if(overwriteBtn) overwriteBtn.onclick = function() {
        const selector = document.getElementById('theme-preset-selector');
        const selectedId = selector && selector.value;
        if (!selectedId || !selectedId.startsWith('custom-')) {
            showNotification('请先选择一个自定义方案再覆盖', 'warning');
            return;
        }
        const theme = customThemes.find(t => t.id === selectedId);
        if (!theme) return;
        if (!confirm(`确定要用当前编辑内容覆盖「${theme.name}」吗？`)) return;
        const root = document.documentElement;
        theme.colors = {};
        for (const variable of Object.keys(themeColorMappings)) {
            const val = root.style.getPropertyValue(variable) || getComputedStyle(root).getPropertyValue(variable).trim();
            if (val) theme.colors[variable] = val.trim();
        }
        for (const variable of Object.keys(themeExtraMappings)) {
            const val = root.style.getPropertyValue(variable) || getComputedStyle(root).getPropertyValue(variable).trim();
            if (val) theme.colors[variable] = val.trim();
        }
        saveCustomThemes();
        showNotification(`已覆盖「${theme.name}」`, 'success');
    };
    
    const renameBtn = document.getElementById('rename-theme-preset-btn');
    if(renameBtn) renameBtn.onclick = () => {
        const selector = document.getElementById('theme-preset-selector');
        const selectedId = selector && selector.value;
        if (!selectedId || !selectedId.startsWith('custom-')) {
            showNotification('请先选择一个自定义方案再重命名', 'warning');
            return;
        }
        const theme = customThemes.find(t => t.id === selectedId);
        if (!theme) return;
        const newName = prompt('输入新名称：', theme.name);
        if (!newName || !newName.trim()) return;
        theme.name = newName.trim();
        saveCustomThemes();
        populateThemeSelector();
        showNotification(`已重命名为「${newName}」`, 'success');
    };

    const delBtn = document.getElementById('delete-theme-preset-btn');
    if(delBtn) delBtn.onclick = deleteCurrentPreset;

    const selector = document.getElementById('theme-preset-selector');
    if(selector) {
        selector.onchange = (e) => {
            const selectedValue = e.target.value;
            const owBtn = document.getElementById('overwrite-theme-preset-btn');
            if (owBtn) owBtn.style.display = selectedValue.startsWith('custom-') ? '' : 'none';
            if (selectedValue === "current-editing") return;
            
            if (selectedValue.startsWith('custom-')) {
                const theme = customThemes.find(t => t.id === selectedValue);
                if (theme) {
                    settings.colorTheme = theme.id;
                    applyTheme(theme.colors);
                    populateThemeEditor(theme.colors);
                    throttledSaveData();
                }
            }
        };
    }
}
        function populateThemeEditor(currentColors = null) {
            const grid = document.getElementById('theme-editor-grid');
            grid.innerHTML = '';
            const rootStyle = getComputedStyle(document.documentElement);

            const colorHeading = document.createElement('div');
            colorHeading.style.cssText = 'grid-column:1/-1;font-size:11px;font-weight:700;color:var(--text-secondary);letter-spacing:2px;text-transform:uppercase;padding:4px 0 2px;border-bottom:1px solid var(--border-color);margin-bottom:4px;';
            colorHeading.textContent = '🎨 颜色';
            grid.appendChild(colorHeading);

            for (const [variable, label] of Object.entries(themeColorMappings)) {
                const rawVal = currentColors ? currentColors[variable] : rootStyle.getPropertyValue(variable).trim();
                let colorValue = rawVal;
                if (!colorValue || colorValue.includes('var(')) {
                    colorValue = '#888888';
                } else if (colorValue.startsWith('rgb')) {
                    try {
                        const m = colorValue.match(/\d+/g);
                        if (m && m.length >= 3) {
                            colorValue = '#' + [m[0],m[1],m[2]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
                        }
                    } catch(e) { colorValue = '#888888'; }
                }
                const item = document.createElement('div');
                item.className = 'color-picker-item';
                item.innerHTML = `<label for="color-${variable.replace(/--/g,'')}">${label}</label><input type="color" id="color-${variable.replace(/--/g,'')}" data-variable="${variable}" value="${colorValue}">`;
                grid.appendChild(item);
                item.querySelector('input[type="color"]').addEventListener('input', (e) => {
                    document.documentElement.style.setProperty(e.target.dataset.variable, e.target.value);
                });
            }

            const extraHeading = document.createElement('div');
            extraHeading.style.cssText = 'grid-column:1/-1;font-size:11px;font-weight:700;color:var(--text-secondary);letter-spacing:2px;text-transform:uppercase;padding:8px 0 2px;border-bottom:1px solid var(--border-color);margin-bottom:4px;margin-top:8px;';
            extraHeading.textContent = '⚙️ 数值 & 字重';
            grid.appendChild(extraHeading);

            for (const [variable, cfg] of Object.entries(themeExtraMappings)) {
                const rawVal = rootStyle.getPropertyValue(variable).trim() || cfg.default;
                const numVal = parseFloat(rawVal);
                const item = document.createElement('div');
                item.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;gap:10px;background:var(--primary-bg);padding:8px;border-radius:8px;';
                if (cfg.type === 'range') {
                    item.innerHTML = `
                        <label style="font-size:13px;flex:1;">${cfg.label}</label>
                        <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step||1}" value="${numVal||parseFloat(cfg.default)}"
                            data-variable="${variable}" data-unit="${cfg.unit}"
                            style="flex:2;max-width:140px;accent-color:var(--accent-color);">
                        <span style="width:44px;text-align:right;font-size:12px;color:var(--text-secondary);">${numVal||parseFloat(cfg.default)}${cfg.unit}</span>`;
                    const rangeInput = item.querySelector('input[type="range"]');
                    const valLabel = item.querySelector('span');
                    rangeInput.addEventListener('input', () => {
                        const v = rangeInput.value + cfg.unit;
                        document.documentElement.style.setProperty(variable, v);
                        valLabel.textContent = rangeInput.value + cfg.unit;
                        if (variable === '--radius') { settings.borderRadius = rangeInput.value; throttledSaveData && throttledSaveData(); }
                        if (variable === '--message-line-height') { settings.messageLineHeight = parseFloat(rangeInput.value); throttledSaveData && throttledSaveData(); }
                    });
                } else if (cfg.type === 'select') {
                    const opts = cfg.options.map(o => `<option value="${o}" ${String(numVal||cfg.default)===o?'selected':''}>${o}</option>`).join('');
                    item.innerHTML = `<label style="font-size:13px;flex:1;">${cfg.label}</label><select data-variable="${variable}" style="padding:5px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--secondary-bg);color:var(--text-primary);font-size:13px;cursor:pointer;">${opts}</select>`;
                    item.querySelector('select').addEventListener('change', (e) => {
                        const newVal = e.target.value;
                        document.documentElement.style.setProperty(variable, newVal);
                        if (variable === '--message-font-weight') { settings.messageFontWeight = newVal; throttledSaveData && throttledSaveData(); }
                        if (variable === '--message-line-height') { settings.messageLineHeight = parseFloat(newVal); throttledSaveData && throttledSaveData(); }
                    });
                }
                grid.appendChild(item);
            }

            const previewHeading = document.createElement('div');
            previewHeading.style.cssText = 'grid-column:1/-1;font-size:11px;font-weight:700;color:var(--text-secondary);letter-spacing:2px;text-transform:uppercase;padding:8px 0 2px;border-bottom:1px solid var(--border-color);margin-bottom:4px;margin-top:8px;';
            previewHeading.textContent = '👁 实时预览';
            grid.appendChild(previewHeading);

            const previewBox = document.createElement('div');
            previewBox.style.cssText = 'grid-column:1/-1;background:var(--chat-bg,var(--primary-bg));border-radius:14px;padding:14px 12px;border:1px solid var(--border-color);';
            previewBox.innerHTML = `
                <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:10px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-user" style="font-size:12px;color:#fff;"></i>
                    </div>
                    <div class="message message-received" style="max-width:180px;font-size:var(--font-size);">你是我朝夕相伴触手可及的虚拟</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end;">
                    <div class="message message-sent" style="max-width:180px;font-size:var(--font-size);">你是我未曾拥有无法捕捉的亲昵</div>
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--border-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-user" style="font-size:12px;color:var(--text-secondary);"></i>
                    </div>
                </div>`;
            grid.appendChild(previewBox);
        }

        function applyTheme(colors, isReset = false) {
            if (isReset) {
                for (const variable of Object.keys(themeColorMappings)) {
                    document.documentElement.style.removeProperty(variable);
                }
                return;
            }
            if (!colors) return;
            for (const [variable, color] of Object.entries(colors)) {
                document.documentElement.style.setProperty(variable, color);
            }
        }
        
        function saveCurrentThemeAsPreset() {
            const presetName = prompt("请输入新主题方案的名称：");
            if (!presetName || !presetName.trim()) return;

            const newTheme = {
                id: `custom-${Date.now()}`,
                name: presetName.trim(),
                colors: {}
            };
            const root = document.documentElement;
            for (const variable of Object.keys(themeColorMappings)) {
                const val = root.style.getPropertyValue(variable) || getComputedStyle(root).getPropertyValue(variable).trim();
                if (val) newTheme.colors[variable] = val.trim();
            }
            for (const variable of Object.keys(themeExtraMappings)) {
                const val = root.style.getPropertyValue(variable) || getComputedStyle(root).getPropertyValue(variable).trim();
                if (val) newTheme.colors[variable] = val.trim();
            }
            customThemes.push(newTheme);
            settings.colorTheme = newTheme.id;
            saveCustomThemes();
            populateThemeSelector();
            showNotification(`主题 "${presetName}" 已保存`, "success");
        }

        function deleteCurrentPreset() {
            const selector = document.getElementById('theme-preset-selector');
            const selectedId = selector.value;
            if (!selectedId.startsWith('custom-')) {
                showNotification('无法删除预设主题', 'warning');
                return;
            }
            if (confirm(`确定要删除主题 "${selector.options[selector.selectedIndex].text}" 吗？`)) {
                customThemes = customThemes.filter(t => t.id !== selectedId);
                settings.colorTheme = 'gold'; 
                saveCustomThemes();
                updateUI();
                populateThemeSelector();
                populateThemeEditor(); 
                showNotification('主题已删除', 'success');
            }
        }

function populateThemeSelector() {
    const selector = document.getElementById('theme-preset-selector');
    selector.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = "current-editing";
    defaultOption.textContent = "当前编辑中...";
    selector.appendChild(defaultOption);

    if (customThemes.length > 0) {
        const customGroup = document.createElement('optgroup');
        customGroup.label = "我的自定义主题";
        customThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            customGroup.appendChild(option);
        });
        selector.appendChild(customGroup);
    }

    if (settings.colorTheme.startsWith('custom-')) {
        selector.value = settings.colorTheme;
    } else {
        selector.value = "current-editing";
    }
    const overwriteBtn = document.getElementById('overwrite-theme-preset-btn');
    if (overwriteBtn) overwriteBtn.style.display = selector.value.startsWith('custom-') ? '' : 'none';
}
        
        function saveCustomThemes() {
             safeSetItem(`${APP_PREFIX}customThemes`, JSON.stringify(customThemes));
        }

        const THEME_COLOR_NAMES = {
            'gold': '金色', 'blue': '蓝色', 'purple': '紫色', 'green': '绿色',
            'pink': '粉色', 'black-white': '黑白', 'pastel': '柔蓝', 
            'sunset': '夕阳', 'forest': '森林', 'ocean': '深蓝'
        };
        const BUBBLE_STYLE_NAMES_SCM = { standard: '标准', rounded: '圆角', 'rounded-large': '大圆角', square: '方形' };

        async function captureCurrentSchemeAsync() {
            const root = document.documentElement;
            let chatBg = '';
            try {
                chatBg = await localforage.getItem(getStorageKey('chatBackground')) || '';
            } catch(e) {
                chatBg = safeGetItem(getStorageKey('chatBackground')) || '';
            }
            return {
                colorTheme: settings.colorTheme,
                isDarkMode: settings.isDarkMode,
                bubbleStyle: settings.bubbleStyle,
                fontSize: settings.fontSize,
                messageFontFamily: settings.messageFontFamily,
                messageFontWeight: settings.messageFontWeight,
                messageLineHeight: settings.messageLineHeight,
                customFontUrl: settings.customFontUrl || '',
                customBubbleCss: settings.customBubbleCss || '',
                inChatAvatarEnabled: settings.inChatAvatarEnabled,
                inChatAvatarSize: settings.inChatAvatarSize,
                chatBackground: chatBg,
                customColors: (() => {
                    const colors = {};
                    const mapped = Object.keys(themeColorMappings || {});
                    mapped.forEach(v => {
                        const val = root.style.getPropertyValue(v);
                        if (val) colors[v] = val.trim();
                    });
                    return colors;
                })()
            };
        }

        function captureCurrentScheme() {
            const root = document.documentElement;
            const chatBg = safeGetItem(getStorageKey('chatBackground')) || '';
            
            return {
                colorTheme: settings.colorTheme,
                isDarkMode: settings.isDarkMode,
                bubbleStyle: settings.bubbleStyle,
                fontSize: settings.fontSize,
                messageFontFamily: settings.messageFontFamily,
                messageFontWeight: settings.messageFontWeight,
                messageLineHeight: settings.messageLineHeight,
                customFontUrl: settings.customFontUrl || '',
                customBubbleCss: settings.customBubbleCss || '',
                inChatAvatarEnabled: settings.inChatAvatarEnabled,
                inChatAvatarSize: settings.inChatAvatarSize,
                chatBackground: chatBg,
                customColors: (() => {
                    const colors = {};
                    const mapped = Object.keys(themeColorMappings || {});
                    mapped.forEach(v => {
                        const val = root.style.getPropertyValue(v);
                        if (val) colors[v] = val.trim();
                    });
                    return colors;
                })()
            };
        }

        function applyScheme(scheme) {
            settings.colorTheme = scheme.colorTheme;
            settings.isDarkMode = scheme.isDarkMode;
            settings.bubbleStyle = scheme.bubbleStyle;
            settings.fontSize = scheme.fontSize;
            settings.messageFontFamily = scheme.messageFontFamily;
            settings.messageFontWeight = scheme.messageFontWeight;
            settings.messageLineHeight = scheme.messageLineHeight;
            settings.customFontUrl = scheme.customFontUrl || '';
            settings.customBubbleCss = scheme.customBubbleCss || '';
            settings.inChatAvatarEnabled = scheme.inChatAvatarEnabled;
            settings.inChatAvatarSize = scheme.inChatAvatarSize;
            
            const root = document.documentElement;
            if (scheme.customColors && Object.keys(scheme.customColors).length > 0) {
                Object.entries(scheme.customColors).forEach(([v, c]) => {
                    root.style.setProperty(v, c);
                });
            } else {
                if (themeColorMappings) {
                    Object.keys(themeColorMappings).forEach(v => root.style.removeProperty(v));
                }
            }
            
            if (scheme.customFontUrl) {
                try { applyCustomFont(scheme.customFontUrl); } catch(e) {}
            } else {
                document.documentElement.style.setProperty('--message-font-family', scheme.messageFontFamily || "'Noto Serif SC', serif");
                document.documentElement.style.setProperty('--font-family', scheme.messageFontFamily || "'Noto Serif SC', serif");
            }
            
            if (scheme.customBubbleCss) {
                try { applyCustomBubbleCss(scheme.customBubbleCss); } catch(e) {}
            }
            
            if (scheme.chatBackground) {
                applyBackground(scheme.chatBackground);
                safeSetItem(getStorageKey('chatBackground'), scheme.chatBackground);
            }

            updateUI();
            throttledSaveData();
            renderThemeSchemesList();
        }

        function getSchemePreviewColors(scheme) {
            const colorMap = {
                gold: ['#c5a47e', '#f5f5f5', '#333333'],
                blue: ['#7FA6CD', '#e8f0f8', '#333333'],
                purple: ['#BB9EC7', '#f3eef7', '#333333'],
                green: ['#7BC8A4', '#edf8f3', '#333333'],
                pink: ['#F4A6B3', '#fef0f3', '#333333'],
                'black-white': ['#333333', '#f9f9f9', '#666666'],
                pastel: ['#A8D8EA', '#edf7fc', '#333333'],
                sunset: ['#FF9A8B', '#fff0ee', '#333333'],
                forest: ['#7BA05B', '#eef5e8', '#333333'],
                ocean: ['#4A90E2', '#e8f1fc', '#333333'],
            };
            const theme = scheme.colorTheme;
            if (theme && theme.startsWith('custom-')) {
                const c = scheme.customColors && scheme.customColors['--accent-color'];
                return [c || '#aaa', scheme.isDarkMode ? '#222' : '#f5f5f5', '#888'];
            }
            return colorMap[theme] || ['#aaa', '#f5f5f5', '#888'];
        }

        function renderThemeSchemesList() {
            const list = document.getElementById('theme-schemes-list');
            const empty = document.getElementById('theme-schemes-empty');
            if (!list) return;
            
            list.querySelectorAll('.theme-scheme-item').forEach(el => el.remove());
            
            if (themeSchemes.length === 0) {
                if (empty) empty.style.display = 'flex';
                return;
            }
            if (empty) empty.style.display = 'none';
            
            themeSchemes.forEach(scheme => {
                const dots = getSchemePreviewColors(scheme);
                const bubbleName = BUBBLE_STYLE_NAMES_SCM[scheme.bubbleStyle] || '标准';
                const darkLabel = scheme.isDarkMode ? '夜' : '昼';
                const themeName = THEME_COLOR_NAMES[scheme.colorTheme] || scheme.colorTheme;
                const meta = `${darkLabel} · ${themeName} · ${bubbleName} · ${scheme.fontSize}px`;
                
                const item = document.createElement('div');
                item.className = 'theme-scheme-item';
                item.dataset.schemeId = scheme.id;
                item.innerHTML = `
                    <div class="scheme-preview-dots">
                        ${dots.map(c => `<div class="scheme-dot" style="background:${c};"></div>`).join('')}
                    </div>
                    <div class="scheme-info">
                        <div class="scheme-name">${scheme.name}</div>
                        <div class="scheme-meta">${meta}</div>
                    </div>
                    <div class="scheme-actions">
                        <button class="scheme-action-btn" title="应用方案" onclick="applyThemeScheme('${scheme.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="scheme-action-btn" title="在编辑器中编辑" onclick="editThemeScheme('${scheme.id}', event)" style="color:var(--accent-color);">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="scheme-action-btn delete" title="删除方案" onclick="deleteThemeScheme('${scheme.id}', event)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        window.applyThemeScheme = function(id) {
            const scheme = themeSchemes.find(s => s.id === id);
            if (!scheme) return;
            applyScheme(scheme);
            showNotification(`✨ 已应用方案「${scheme.name}」`, 'success');
        };

        window.deleteThemeScheme = function(id, event) {
            if (event) event.stopPropagation();
            const scheme = themeSchemes.find(s => s.id === id);
            if (!scheme) return;
            if (confirm(`确定要删除方案「${scheme.name}」吗？`)) {
                themeSchemes = themeSchemes.filter(s => s.id !== id);
                localforage.setItem(`${APP_PREFIX}themeSchemes`, themeSchemes);
                renderThemeSchemesList();
                showNotification('方案已删除', 'success');
            }
        };

        window.editThemeScheme = function(id, event) {
            if (event) event.stopPropagation();
            const scheme = themeSchemes.find(s => s.id === id);
            if (!scheme) return;
            applyScheme(scheme);
            const appearanceModal = document.getElementById('appearance-modal');
            const editorModal = document.getElementById('theme-editor-modal');
            if (appearanceModal) hideModal(appearanceModal);
            populateThemeEditor(scheme.customColors && Object.keys(scheme.customColors).length > 0 ? scheme.customColors : null);
            populateThemeSelector();
            if (editorModal) showModal(editorModal);
            const selector = document.getElementById('theme-preset-selector');
            if (selector && scheme.id.startsWith('custom-')) selector.value = scheme.id;
            showNotification(`正在编辑方案「${scheme.name}」，修改后点击💾保存`, 'info');
        };

        function initThemeSchemes() {
            const saveBtn = document.getElementById('save-theme-scheme-btn');
            if (saveBtn) {
                saveBtn.onclick = async () => {
                    const name = prompt('请为当前主题方案命名：', `方案 ${themeSchemes.length + 1}`);
                    if (!name || !name.trim()) return;
                    const scheme = await captureCurrentSchemeAsync();
                    scheme.id = `scheme-${Date.now()}`;
                    scheme.name = name.trim();
                    scheme.savedAt = Date.now();
                    themeSchemes.push(scheme);
                    localforage.setItem(`${APP_PREFIX}themeSchemes`, themeSchemes);
                    renderThemeSchemesList();
                    showNotification(`✨ 方案「${name}」已保存（含背景图）！`, 'success');
                };
            }
            renderThemeSchemesList();
        }

document.addEventListener('DOMContentLoaded', async () => {
    const loaderBar = document.getElementById('loader-tech-bar');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle-scramble');
    const welcomeScreen = document.getElementById('welcome-animation');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const acceptDisclaimerBtn = document.getElementById('accept-disclaimer');

    const updateLoader = (text, width) => {
        if (welcomeSubtitle) welcomeSubtitle.textContent = text;
        if (loaderBar) loaderBar.style.width = width;
    };

    const hideWelcomeScreen = () => {
        if (!welcomeScreen) return;
        welcomeScreen.classList.add('hidden');
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
        }, 800);
    };

    const safeAwait = async (promise, fallback = null) => {
        try {
            return await promise;
        } catch (error) {
            console.error('操作失败:', error);
            return fallback;
        }
    };

    try {
        safeAwait(Promise.all([
            setupEventListeners?.(),
            initThemeEditor?.(),
            initAnniversaryModule?.(),
            initMoodListeners?.(),
            initDecisionModule?.(),
            initComboMenu?.()
        ]));

        if (typeof localforage === 'undefined') {
            console.warn('LocalForage 未加载，将使用 localStorage 降级方案');
        }

        updateLoader('正在建立安全连接...', '10%');
        await safeAwait(initializeSession());

        updateLoader('正在读取记忆存档...', '40%');
        await safeAwait(loadData());

        updateLoader('正在渲染我们的世界...', '70%');
        
        await Promise.allSettled([
            safeAwait(initializeRandomUI?.()),
            safeAwait(initMusicPlayer?.())
        ]);

        setInterval(checkStatusChange, 60000);

        if (disclaimerModal) {
            const tourSeen = await safeAwait(localforage?.getItem(APP_PREFIX + 'tour_seen'), false);
            
            if (!tourSeen) {
                showModal(disclaimerModal);
                
                if (acceptDisclaimerBtn) {
                    acceptDisclaimerBtn.addEventListener('click', () => {
                        hideModal(disclaimerModal);
                        startTour?.();
                    }, { once: true }); 
                }
            }
        }
        
        if (acceptDisclaimerBtn && !acceptDisclaimerBtn._closeFixed) {
            acceptDisclaimerBtn._closeFixed = true;
            acceptDisclaimerBtn.addEventListener('click', () => {
                if (disclaimerModal && disclaimerModal.style.display !== 'none') {
                    hideModal(disclaimerModal);
                }
            });
        }

        updateLoader('连接成功，欢迎回来。', '100%');
        setTimeout(hideWelcomeScreen, 3500);

        setTimeout(async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        showNotification('已开启系统通知，收到消息时会提醒你 ✨', 'success', 3000);
                    }
                } catch(e) {
                    console.warn('通知权限请求失败:', e);
                }
            }
        }, 3000);

    } catch (err) {
        console.error('严重初始化错误:', err);
        updateLoader('加载遇到问题，已强制进入...', '100%');
        setTimeout(hideWelcomeScreen, 3500);
    }
});
const stickerInput = document.getElementById('sticker-file-input');
            if (stickerInput) {
                stickerInput.addEventListener('change', async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;

                    const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
                    if (oversized.length > 0) {
                        showNotification(oversized.length + ' 张图片超过 2MB 限制，已跳过', 'warning');
                    }

                    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
                    if (!validFiles.length) return;

                    showNotification('正在批量处理 ' + validFiles.length + ' 张图片...', 'info');

                    let successCount = 0;
                    let failCount = 0;

                    for (const file of validFiles) {
                        try {
                            const base64 = await optimizeImage(file, 300, 0.8);
                            stickerLibrary.push(base64);
                            successCount++;
                        } catch (err) {
                            console.error(err);
                            failCount++;
                        }
                    }

                    throttledSaveData();
                    renderReplyLibrary();

                    if (failCount > 0) {
                        showNotification('上传完成：' + successCount + ' 张成功，' + failCount + ' 张失败', 'warning');
                    } else {
                        showNotification('上传成功，共 ' + successCount + ' 张', 'success');
                    }

                    e.target.value = '';
                });
            }
const myStickerQuickUpload = document.getElementById('my-sticker-quick-upload');
if (myStickerQuickUpload) {
    myStickerQuickUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
        if (oversized.length > 0) showNotification(oversized.length + ' 张图片超过 2MB，已跳过', 'warning');
        const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
        if (!validFiles.length) return;
        showNotification('正在处理 ' + validFiles.length + ' 张...', 'info');
        let ok = 0, fail = 0;
        for (const file of validFiles) {
            try {
                const base64 = await optimizeImage(file, 300, 0.8);
                myStickerLibrary.push(base64);
                ok++;
            } catch(err) { fail++; }
        }
        throttledSaveData();
        if (typeof renderComboContent === 'function') renderComboContent('my-sticker');
        showNotification(fail > 0 ? `上传完成：${ok} 成功 ${fail} 失败` : `✓ 已添加 ${ok} 张到我的表情库`, fail > 0 ? 'warning' : 'success');
        e.target.value = '';
    });
}
const tourOverlay = document.getElementById('tour-overlay');
const tourPopover = document.getElementById('tour-popover');
const tourHighlightBox = document.getElementById('tour-highlight-box');
const tourTitle = document.getElementById('tour-title');
const tourContent = document.getElementById('tour-content');
const tourStepCounter = document.getElementById('tour-step-counter');
const tourNextBtn = document.getElementById('tour-next-btn');
const tourPrevBtn = document.getElementById('tour-prev-btn');
const tourSkipBtn = document.getElementById('tour-skip-btn');

let currentTourStep = 0;
let isTourActive = false;

const tourSteps = [
    {
        title: "✨ 欢迎来到「传讯」",
        content: "这里是你们专属的私密空间。<br><br>这个教程共 <b>20 步</b>，带你从头到尾认识每一个功能，建议完整看完哦🥺<br><br>点击「下一步」开始吧！",
        position: 'center'
    },
    {
        element: '#my-avatar',
        title: "📷 你的头像",
        content: "这是<b>你的头像</b>。<br><br>点击它可以上传图片作为你的头像。",
        position: 'bottom'
    },
    {
        element: '#my-name',
        title: "✏️ 你的昵称",
        content: "这里显示的是<b>你的名字</b>。<br><br>点击名字可以直接修改。",
        position: 'bottom'
    },
    {
        element: '#my-status-container',
        title: "💬 你的状态签名",
        content: "这里是你的<b>状态签名</b>。<br><br>点击可以编辑，一般而言对方是能看见的哦～",
        position: 'bottom'
    },
    {
        element: '#partner-avatar',
        title: "Ta 的头像",
        content: "这里是<b>梦角的头像</b>，同样点击可以上传更换。",
        position: 'bottom'
    },
    {
        element: '#partner-name',
        title: "Ta 的昵称",
        content: "这是<b>梦角的昵称</b>，同样点击可以修改。",
        position: 'bottom'
    },
    {
        element: '.header-motto',
        title: "🌸 顶部格言",
        content: "这里显示着格言～自定义回复里可修改。",
        position: 'bottom'
    },
    {
        element: '#message-input',
        title: "⌨️ 消息输入框",
        content: "在这里<b>输入你想说的话</b>，按回车键或点击右边的发送按钮就能发出去。",
        position: 'top'
    },
    {
        element: '#send-btn',
        title: "🚀 发送消息",
        content: "点击这个<b>纸飞机按钮</b>就能发送消息。<br><br>发送后对方会在几秒内给你回复，你可以在「聊天设置」里调整回复的速度快慢哦。",
        position: 'top'
    },
    {
        element: '#attachment-btn',
        title: "🖼️ 发送图片 / 表情包",
        content: "点击这里可以<b>发送图片</b>，支持相册图片和表情包。<br><br>你还可以在「高级功能 → 回复库」中上传自定义的表情，到时候对方也会发给你！",
        position: 'top'
    },
    {
        element: '#poke-btn',
        title: "👋 拍一拍互动",
        content: "这是「<b>拍一拍</b>」功能，发出后会显示一条互动消息，比如「轻拍了你一下」。<br><br>可以在「高级功能 → 自定义拍一拍」里添加更多的动作！",
        position: 'top'
    },
    {
        element: '#continue-btn',
        title: "让 Ta 继续说",
        content: "不知道说什么了？或者想让 Ta 多说几句？<br><br>点击这个按钮，<b>梦角会主动找你说话。",
        position: 'top'
    },
    {
        element: '#batch-btn',
        title: "📦 批量发送模式",
        content: "开启<b>批量模式</b>后，你可以先写好多条消息，再一次性全部发出去<br><br>点击按钮开启，编辑完成后再次点击「发送全部」即可。",
        position: 'top'
    },
    {
        element: '#settings-btn',
        title: "⚙️ 设置中心",
        content: "所有个性化配置都在这个<b>设置按钮</b>里，我们点进去看一下！<br>",
        position: 'bottom',
        onBefore: () => { if (isTourActive) document.querySelectorAll('.modal').forEach(m => hideModal(m)); }
    },
    {
        element: '#appearance-settings',
        title: "🎨 外观设置",
        content: "<b>外观设置</b>里可以：<br>• 切换 10 款主题配色（金/蓝/粉…）<br>• 调整字体大小<br>• 更换聊天背景图<br>• 自定义气泡样式 CSS<br>",
        position: 'bottom',
        onBefore: () => { if (isTourActive) showModal(DOMElements.settingsModal.modal); }
    },
    {
        element: '#chat-settings',
        title: "💬 聊天设置",
        content: "<b>聊天设置</b>里可以调整：<br>• 消息音效开关<br>• 已读回执显示<br>• 对方回复速度（快/慢）<br>• 消息气泡样式（圆角/方形）",
        position: 'bottom'
    },
    {
        element: '#advanced-settings',
        title: "🚀 高级功能 — 必看！",
        content: "<b>高级功能</b>是整个应用最强大的板块，里面有：<br>• <b>心晴手账</b>：记录每天的心情<br>• <b>信封投递</b>：给梦角写一封信<br>• <b>纪念日</b>：倒计时 / 纪念天数<br>• <b>运势占卜</b>：每日运势<br>• <b>自定义回复</b>：让梦角说你想听的话<br>• <b>音乐播放器</b>：背景音乐",
        position: 'bottom'
    },
    {
        element: '#data-settings',
        title: "💾 数据管理",
        content: "<b>数据管理</b>里可以：<br>• 导出聊天记录（备份到本地）<br>• 导入之前备份的记录<br>• 查看存储空间占用<br>• 开启后台消息通知推送<br>• 重置所有数据<br>• 重放本教程",
        position: 'top'
    },
    {
        element: '#theme-toggle',
        title: "🌙 日 / 夜模式切换",
        content: "这个按钮可以快速<b>切换白天 / 夜晚</b>模式。<br><br>夜晚模式下整体变成深色背景，对眼睛更友好，睡前聊天必备！✨",
        position: 'bottom',
        onBefore: () => { if (isTourActive) hideModal(DOMElements.settingsModal.modal); }
    },
    {
        element: '#favorites-btn',
        title: "⭐ 收藏夹",
        content: "长按或点击一条消息，会弹出操作菜单，可以把消息<b>收藏</b>起来。<br><br>所有收藏的消息都会保存在这个收藏夹里，随时可以翻阅回味～",
        position: 'bottom'
    },
    {
        element: '#session-manager-btn',
        title: "📂 会话管理",
        content: "你可以创建<b>多个独立的聊天会话</b>，每个会话都有独立的聊天记录。<br>",
        position: 'bottom'
    },
    {
        title: "✋ 消息操作提示",
        content: "点击任意一条消息，会出现操作菜单：<br>• ⭐ <b>收藏</b>：保存到收藏夹<br>• ↩️ <b>回复</b>：引用这条消息回复<br>• 📝 <b>注释</b>：给消息添加备注<br>• 🗑️ <b>删除</b>：删除这条消息",
        position: 'center'
    },
    {
        title: "🎉 你已掌握所有功能！",
        content: "恭喜你完成了新手引导！现在你已经了解了「传讯」的全部功能。<br><br>希望你们在这里收获满满的爱与幸福 🥺💕",
        position: 'center'
    }
];

function startTour() {
    isTourActive = true;
    tourOverlay.style.display = 'block';
    setTimeout(() => tourOverlay.classList.add('active'), 10);
    currentTourStep = 0;
    showTourStep(currentTourStep);
}

function endTour() {
    isTourActive = false;
    tourOverlay.classList.remove('active');
    tourPopover.classList.remove('visible');
    setTimeout(() => {
        tourOverlay.style.display = 'none';
        tourHighlightBox.style.width = '0px';
        tourHighlightBox.style.height = '0px';
        tourHighlightBox.style.opacity = '0';
    }, 300);
    localforage.setItem(APP_PREFIX + 'tour_seen', 'true');
    document.querySelectorAll('.modal').forEach(m => hideModal(m));
    setTimeout(function() {
        if (typeof window.tryShowDailyGreeting === 'function') {
            window.tryShowDailyGreeting();
        }
    }, 900);
}

function showTourStep(index) {
    if (index < 0 || index >= tourSteps.length) {
        endTour();
        return;
    }
    const step = tourSteps[index];
    if (step.onBefore) {
        step.onBefore();
    }
    setTimeout(() => {
        tourTitle.textContent = step.title;
        tourContent.innerHTML = step.content;
        tourStepCounter.textContent = `${index + 1} / ${tourSteps.length}`;
        tourPopover.classList.remove('visible');
        tourPrevBtn.style.visibility = (index === 0) ? 'hidden' : 'visible';
        if (index === tourSteps.length - 1) {
            tourNextBtn.innerHTML = '完成 <i class="fas fa-check"></i>';
        } else {
            tourNextBtn.innerHTML = '下一步 <i class="fas fa-arrow-right"></i>';
        }
        const targetElement = step.element ? document.querySelector(step.element) : null;
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            tourHighlightBox.style.width = `${rect.width + 10}px`;
            tourHighlightBox.style.height = `${rect.height + 10}px`;
            tourHighlightBox.style.top = `${rect.top - 5}px`;
            tourHighlightBox.style.left = `${rect.left - 5}px`;
            tourHighlightBox.style.opacity = '1';
            positionPopover(rect, step.position);
        } else {
            tourHighlightBox.style.opacity = '0';
            tourHighlightBox.style.width = '0px';
            tourHighlightBox.style.height = '0px';
            tourPopover.style.top = '50%';
            tourPopover.style.left = '50%';
            tourPopover.style.transform = 'translate(-50%, -50%)';
        }
        setTimeout(() => tourPopover.classList.add('visible'), 50);
    }, (step.onBefore ? 400 : 0));
}

function positionPopover(rect, position) {
    const popoverRect = tourPopover.getBoundingClientRect();
    const spacing = 15;
    let top, left;
    switch (position) {
        case 'top':
            top = rect.top - popoverRect.height - spacing;
            left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
            break;
        case 'bottom':
            top = rect.bottom + spacing;
            left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
            break;
        case 'left':
            top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
            left = rect.left - popoverRect.width - spacing;
            break;
        case 'right':
            top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
            left = rect.right + spacing;
            break;
        default:
            top = '50%';
            left = '50%';
            tourPopover.style.transform = 'translate(-50%, -50%)';
            tourPopover.style.top = top;
            tourPopover.style.left = left;
            return;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;
    if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
    }
    if (top + popoverRect.height > window.innerHeight - 10) {
        top = window.innerHeight - popoverRect.height - 10;
    }
    tourPopover.style.top = `${top}px`;
    tourPopover.style.left = `${left}px`;
    tourPopover.style.transform = 'none';
}

function nextTourStep() {
    currentTourStep++;
    showTourStep(currentTourStep);
}

async function createNewSession(switchToIt = true) {
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newSession = {
        id: newId,
        name: `会话 ${new Date().toLocaleDateString()}`,
        createdAt: Date.now()
    };

    sessionList.push(newSession);
    await localforage.setItem(`${APP_PREFIX}sessionList`, sessionList);

    if (switchToIt) {
        window.location.hash = newId;
        window.location.reload();
    }
    
    return newId;
}

window.selectAnnType = function(type) {
    currentAnniversaryType = type;
    currentAnnType = type; 
    document.querySelectorAll('.anniversary-type-btn').forEach(btn => {
        if(btn.dataset.type === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const hint = document.getElementById('ann-type-desc');
    if(hint) {
        hint.textContent = type === 'anniversary' 
            ? '计算从过去某一天到现在已经过了多少天 (例如: 恋爱纪念日)' 
            : '计算从现在到未来某一天还剩下多少天 (例如: 对方生日)';
    }
};

window.deleteAnniversary = function(id, event) {
    if(event) event.stopPropagation();
    
    if(confirm('确定要删除这个纪念日吗？')) {
        anniversaries = anniversaries.filter(a => a.id !== id);
        throttledSaveData();
        renderAnniversariesList();
        showNotification('纪念日已删除', 'success');
    }
};

let activeAnnId = null;

async function fillAnnHeaderCard(ann) {
    const headerCard = document.getElementById('ann-header-card');
    const toolbar = document.getElementById('ann-card-toolbar');
    if (!ann || !headerCard) return;

    activeAnnId = ann.id;
    headerCard.style.display = 'block';
    if (toolbar) toolbar.style.display = 'flex';

    const now = new Date();
    const isCountdown = ann.type === 'countdown';
    const targetDate = new Date(ann.date);
    let diffDays;
    if (isCountdown) {
        diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = 0;
    } else {
        diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) diffDays = 0;
    }

    const iconEl = document.getElementById('ann-header-icon');
    const labelEl = document.getElementById('ann-header-label');
    if (iconEl) iconEl.textContent = isCountdown ? '♡' : '♥';
    if (labelEl) labelEl.textContent = isCountdown ? 'COUNTDOWN' : 'ANNIVERSARY';
    document.getElementById('ann-header-title').textContent = ann.name;
    document.getElementById('ann-header-date').textContent = ann.date;
    const daysEl = document.getElementById('ann-header-days');
    daysEl.innerHTML = `${diffDays.toLocaleString('zh-CN')}<span class="ann-header-days-unit">${isCountdown ? '天后' : '天'}</span>`;

    const milestonesEl = document.getElementById('ann-header-milestones');
    if (milestonesEl) {
        milestonesEl.innerHTML = '';
        if (!isCountdown) {
            const milestones = [];
            if (diffDays >= 100) { const n = Math.floor(diffDays / 100); milestones.push(`🎉 第 ${n * 100} 天`); }
            if (diffDays >= 365) { const n = Math.floor(diffDays / 365); milestones.push(`🎊 ${n} 周年`); }
            if (diffDays > 0 && diffDays < 100) { milestones.push(`💫 距 100 天还有 ${100 - diffDays} 天`); }
            milestones.forEach(m => milestonesEl.insertAdjacentHTML('beforeend', `<span class="ann-milestone-chip">${m}</span>`));
        }
    }

    const bgEl = document.getElementById('ann-header-card-bg');
    if (bgEl) {
        const savedBg = await localforage.getItem(getStorageKey(`annHeaderBg_${ann.id}`));
        bgEl.style.backgroundImage = savedBg ? `url(${savedBg})` : '';
    }

    document.querySelectorAll('.ann-item-card').forEach(el => el.classList.remove('ann-item-active'));
    const activeEl = document.querySelector(`.ann-item-card[data-ann-id="${ann.id}"]`);
    if (activeEl) activeEl.classList.add('ann-item-active');
}

function renderAnniversariesList() {
    const listContainer = document.getElementById('ann-list-container');
    const headerCard = document.getElementById('ann-header-card');
    const toolbar = document.getElementById('ann-card-toolbar');
    
    if (!listContainer) return;
    listContainer.innerHTML = '';

    anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (anniversaries.length === 0) {
        if (headerCard) headerCard.style.display = 'none';
        if (toolbar) toolbar.style.display = 'none';
        listContainer.innerHTML = `
            <div class="ann-empty">
                <div class="ann-empty-icon">💝</div>
                <p>还没有纪念日<br>去添加一个属于你们的日子吧~</p>
            </div>`;
        return;
    }

    const now = new Date();
    const defaultAnn = anniversaries.find(a => a.type === 'anniversary') || anniversaries[0];
    fillAnnHeaderCard(defaultAnn);

    anniversaries.forEach(ann => {
        const targetDate = new Date(ann.date);
        let diffDays = 0;
        let typeClass = '';
        let typeLabel = '';
        let dayLabel = '';

        if (ann.type === 'countdown') {
            typeClass = 'type-future';
            typeLabel = '倒数';
            dayLabel = '天后';
            diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
            if(diffDays < 0) diffDays = 0;
        } else {
            typeClass = 'type-past';
            typeLabel = '已过';
            dayLabel = '天';
            diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
        }

        const formattedDays = diffDays.toLocaleString('zh-CN');

        const html = `
            <div class="ann-item-card ${typeClass}" data-ann-id="${ann.id}" onclick="selectAnnCard(${ann.id})" style="cursor:pointer;">
                <div class="ann-item-left">
                    <div class="ann-item-name">${ann.name}</div>
                    <div class="ann-item-date">
                        <span class="ann-tag">${typeLabel}</span>
                        ${ann.date}
                    </div>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="ann-item-right">
                        <div class="ann-item-days">${formattedDays}</div>
                        <div class="ann-item-days-unit">${dayLabel}</div>
                    </div>
                    <div class="ann-delete-btn" onclick="event.stopPropagation(); deleteAnniversaryItem(${ann.id})">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });
}

window.selectAnnCard = function(id) {
    const ann = anniversaries.find(a => a.id === id);
    if (ann) fillAnnHeaderCard(ann);
};

window.clearAnnCardBg = async function() {
    if (!activeAnnId) return;
    await localforage.removeItem(getStorageKey(`annHeaderBg_${activeAnnId}`));
    const bgEl = document.getElementById('ann-header-card-bg');
    if (bgEl) bgEl.style.backgroundImage = '';
    showNotification('封面图已清除', 'success');
};


function initAnniversaryModule() {
    const entryBtn = document.getElementById('anniversary-function');
    
    if (entryBtn) {
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('重要日按钮被点击');
            
            const advancedModal = document.getElementById('advanced-modal');
            const annModal = document.getElementById('anniversary-modal');
            
            if (advancedModal) hideModal(advancedModal);
            renderAnniversariesList();
            if (annModal) showModal(annModal);
        });
    }

    const closeBtn = document.getElementById('close-anniversary-modal');
    if (closeBtn) {
        const newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);
        newClose.addEventListener('click', () => hideModal(document.getElementById('anniversary-modal')));
    }

    const openAddBtn = document.getElementById('open-ann-add-btn');
    const editorSlide = document.getElementById('ann-editor-slide');
    if (openAddBtn) {
        openAddBtn.onclick = () => {
            document.getElementById('ann-input-name').value = '';
            document.getElementById('ann-input-date').value = '';
            window.selectAnnType('anniversary');
            if (editorSlide) editorSlide.classList.add('active');
        };
    }

    const closeEditorBtn = document.getElementById('close-ann-editor');
    if (closeEditorBtn) {
        closeEditorBtn.onclick = () => {
            if (editorSlide) editorSlide.classList.remove('active');
        };
    }

    const saveBtn = document.getElementById('save-ann-btn');
    if (saveBtn) {
        const newSave = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSave, saveBtn);
        
        newSave.addEventListener('click', () => {
            addAnniversary(); 
            if (editorSlide) editorSlide.classList.remove('active');
        });
    }

    const annBgInput = document.getElementById('ann-header-bg-input');
    if (annBgInput) {
        annBgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!activeAnnId) { showNotification('请先选择一个纪念日', 'warning'); return; }
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const dataUrl = ev.target.result;
                const bgEl = document.getElementById('ann-header-card-bg');
                if (bgEl) bgEl.style.backgroundImage = `url(${dataUrl})`;
                await localforage.setItem(getStorageKey(`annHeaderBg_${activeAnnId}`), dataUrl);
                showNotification('封面图已更新 ', 'success');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }
}
function prevTourStep() {
    currentTourStep--;
    showTourStep(currentTourStep);
}

function setupTutorialListeners() {
    tourNextBtn.addEventListener('click', nextTourStep);
    tourPrevBtn.addEventListener('click', prevTourStep);
    tourSkipBtn.addEventListener('click', endTour);

    const replayBtn = document.getElementById('replay-tutorial-btn');
    if(replayBtn) {
        replayBtn.addEventListener('click', () => {
            hideModal(DOMElements.dataModal.modal);
            setTimeout(() => {
                if (confirm('确定要重新开始新手引导教程吗？')) {
                    startTour();
                }
            }, 300);
        });
    }
}