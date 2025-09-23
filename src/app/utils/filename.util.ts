export const generateFileName = (
  userName: string,
  originalname: string,
  prefix = ""
): string => {
  const name = userName.trim().toLowerCase().replace(/\s+/g, "-");
  const ext = originalname.split(".").pop() || "jpg"; 
  const timestamp = Date.now();
  return `${prefix}${name}_${timestamp}.${ext}`;
};
