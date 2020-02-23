

export async function sleep(timeoutMs=1e3) {
  return await new Promise(resolve => setTimeout(resolve, timeoutMs))
}

export const fileExtensionIconClasses = {
  'default': ['fa', 'fa-file'],

  'avi': ['fa', 'fa-file-video'],
  'bmp': ['fa', 'fa-image'],
  'csv': ['fa', 'fa-file-csv'],
  'doc': ['fa', 'fa-file-word'],
  'docx': ['fa', 'fa-file-word'],
  'gif': ['fa', 'fa-image'],
  'img': ['fa', 'fa-image'],
  'jpg': ['fa', 'fa-image'],
  'jpeg': ['fa', 'fa-image'],
  'mov': ['fa', 'fa-file-video'],
  'mp4': ['fa', 'fa-file-video'],
  'mpeg': ['fa', 'fa-file-video'],
  'mpg': ['fa', 'fa-file-video'],
  'nessus': ['fa', 'fa-file-code'],
  'pdf': ['fa', 'fa-file-pdf'],
  'png': ['fa', 'fa-image'],
  'wmv': ['fa', 'fa-file-video'],
  'xls': ['fa', 'fa-file-excel'],
  'xlsx': ['fa', 'fa-file-excel'],
  'xml': ['fa', 'fa-file-code'],
  'zip': ['fa', 'fa-file-archive']
}
