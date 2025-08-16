
import { useState } from "react";

export default function App() {
  const [currentUser, setCurrentUser] = useState("泡芙");
  const [users, setUsers] = useState({
    泡芙: { points: 0, usedBoosts: 0, tasks: [], redeemed: [] },
    泡芙男友: { points: 0, usedBoosts: 0, tasks: [], redeemed: [] }
  });
  const [taskName, setTaskName] = useState("");
  const [taskPoints, setTaskPoints] = useState(1);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState(1);
  const [storeItems, setStoreItems] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ 泡芙: [], 泡芙男友: [] });

  const MAX_POINTS = 40;
  const MAX_BOOSTS = 3;

  const addTask = () => {
    if (!taskName) return;
    const newTask = { name: taskName, done: false, basePoints: Number(taskPoints), boosted: false };
    setUsers({
      ...users,
      [currentUser]: {
        ...users[currentUser],
        tasks: [...users[currentUser].tasks, newTask]
      }
    });
    setTaskName("");
    setTaskPoints(1);
  };

  const toggleTask = (index) => {
    const updated = [...users[currentUser].tasks];
    updated[index].done = !updated[index].done;
    setUsers({
      ...users,
      [currentUser]: {
        ...users[currentUser],
        tasks: updated
      }
    });
  };

  const boostTask = (index) => {
    const user = users[currentUser];
    if (user.usedBoosts >= MAX_BOOSTS) return alert("本月特效已用完！");
    const updated = [...user.tasks];
    if (!updated[index].boosted) {
      updated[index].basePoints *= 1.5;
      updated[index].boosted = true;
      setUsers({
        ...users,
        [currentUser]: {
          ...user,
          tasks: updated,
          usedBoosts: user.usedBoosts + 1
        }
      });
    }
  };

  const calculatePoints = () => {
    const user = users[currentUser];
    const earned = user.tasks.reduce((acc, t) => t.done ? acc + t.basePoints : acc, 0);
    let bonus = 0;
    if (user.tasks.length > 0 && user.tasks.every(t => t.done)) bonus += 2;
    if (window.confirm("今天刷手机时间是否少于2小时？")) bonus += 3;
    if (window.confirm("你是今天最早开始工作的吗？")) bonus += 2;
    if (window.confirm("你是本周期专注时间最长的吗？")) bonus += 3;

    const total = Math.floor(earned + bonus);
    const newTotal = user.points + total;
    const adjustedTotal = newTotal > MAX_POINTS ? MAX_POINTS : newTotal;

    if (newTotal > MAX_POINTS) {
      alert(`你本次应得 ${total} 分，但积分已达上限 40 分，无法全部计入。`);
    } else {
      alert(`你本次获得 ${total} 分，当前积分：${adjustedTotal}`);
    }

    setUsers({
      ...users,
      [currentUser]: {
        ...user,
        points: adjustedTotal,
        tasks: []
      }
    });
    setMonthlyStats({
      ...monthlyStats,
      [currentUser]: [...monthlyStats[currentUser], { date: new Date().toLocaleDateString(), earned: total }]
    });
  };

  const addStoreItem = () => {
    if (!itemName) return;
    setStoreItems([...storeItems, { name: itemName, cost: Number(itemCost) }]);
    setItemName("");
    setItemCost(1);
  };

  const redeemItem = (index) => {
    const user = users[currentUser];
    const item = storeItems[index];
    if (user.points < item.cost) return alert("积分不足，无法兑换。");
    setUsers({
      ...users,
      [currentUser]: {
        ...user,
        points: user.points - item.cost,
        redeemed: [...user.redeemed, { ...item, date: new Date().toLocaleDateString() }]
      }
    });
  };

  return (
    <main className="p-6 max-w-xl mx-auto font-sans">
      <div className="mb-4">
        <label className="mr-2 font-bold">切换身份：</label>
        <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} className="p-2 rounded border">
          <option>泡芙</option>
          <option>泡芙男友</option>
        </select>
      </div>

      <h1 className="text-2xl font-bold text-pink-600 mb-4">🌸 一起做事吧 · 积分系统</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">📝 今日待办</h2>
        <div className="flex gap-2 mb-3">
          <input placeholder="任务名称" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="flex-1 p-2 border rounded" />
          <input type="number" min="1" placeholder="积分" value={taskPoints} onChange={(e) => setTaskPoints(e.target.value)} className="w-20 p-2 border rounded" />
          <button onClick={addTask} className="bg-pink-500 text-white px-4 py-2 rounded">添加</button>
        </div>
        {users[currentUser].tasks.map((task, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded p-2 my-1 shadow-sm">
            <div>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(index)} className="mr-2" />
              {task.name}（{task.basePoints} 分{task.boosted ? "🔥" : ""}）
            </div>
            {!task.boosted && users[currentUser].usedBoosts < MAX_BOOSTS && (
              <button className="text-xs px-2 py-1 border rounded" onClick={() => boostTask(index)}>迎难而上 ✨</button>
            )}
          </div>
        ))}
        <div className="text-sm mt-2 text-gray-500">本月已用特效次数：{users[currentUser].usedBoosts}/3</div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">💰 我的积分余额：{users[currentUser].points} / {MAX_POINTS}</h2>
        <button onClick={calculatePoints} className="bg-yellow-300 px-4 py-2 rounded hover:bg-yellow-400">结算今天积分 🎉</button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">🎁 心愿商店</h2>
        <div className="flex gap-2 mb-3">
          <input placeholder="心愿项目" value={itemName} onChange={(e) => setItemName(e.target.value)} className="flex-1 p-2 border rounded" />
          <input type="number" min="1" placeholder="积分" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className="w-20 p-2 border rounded" />
          <button onClick={addStoreItem} className="bg-green-500 text-white px-4 py-2 rounded">添加</button>
        </div>
        {storeItems.map((item, index) => (
          <div key={index} className="flex justify-between bg-white rounded p-2 my-1 shadow-sm">
            <span>{item.name}（{item.cost} 分）</span>
            <button onClick={() => redeemItem(index)} className="text-xs px-2 py-1 border rounded">兑换</button>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">📜 已兑换心愿</h2>
        {users[currentUser].redeemed.length === 0 ? <p className="text-sm text-gray-500">暂无记录</p> :
          users[currentUser].redeemed.map((item, index) => (
            <div key={index} className="text-sm mb-1">✅ {item.name}（{item.cost} 分） - {item.date}</div>
          ))}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">📊 每月统计</h2>
        {monthlyStats[currentUser].length === 0 ? <p className="text-sm text-gray-500">暂无积分记录</p> :
          monthlyStats[currentUser].map((entry, index) => (
            <div key={index} className="text-sm mb-1">📅 {entry.date}：获得 {entry.earned} 分</div>
          ))}
      </div>
    </main>
  );
}
