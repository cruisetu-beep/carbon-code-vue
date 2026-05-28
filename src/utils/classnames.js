// cx(...args) → 拼接非空 className，等价于原版 React 的 cx
export const cx = (...xs) => xs.filter(Boolean).join(' ')
