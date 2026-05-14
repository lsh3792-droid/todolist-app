const userService = require('../services/userService');
const { asyncHandler } = require('../utils/asyncHandler');

const getMe = asyncHandler(async (req, res) => {
  console.log(`[user] 내 정보 조회 - userId: ${req.user.id}`);
  const user = await userService.getMe(req.user.id);
  res.status(200).json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    },
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  console.log(
    `[user] 내 정보 수정 요청 - userId: ${req.user.id}, name 변경: ${!!name}, 비밀번호 변경: ${!!newPassword}`,
  );
  const user = await userService.updateMe(req.user.id, {
    name,
    currentPassword,
    newPassword,
  });
  console.log(`[user] 내 정보 수정 완료 - userId: ${user.id}`);
  res.status(200).json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

const deleteMe = asyncHandler(async (req, res) => {
  console.log(`[user] 회원 탈퇴 요청 - userId: ${req.user.id}`);
  await userService.deleteMe(req.user.id);
  console.log(`[user] 회원 탈퇴 완료 - userId: ${req.user.id}`);
  res.status(204).send();
});

module.exports = { getMe, updateMe, deleteMe };
