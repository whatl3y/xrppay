import assert from 'assert'
import FileManagement from './FileManagement'

const fileMgmt = new FileManagement()

describe('FileManagement', function() {
  describe('#getFileName', function() {
    it(`should append appropriate text to new filename from original`, function() {
      const newFilename1 = fileMgmt.getFileName('abc.txt', 'additional')
      const newFilename2 = fileMgmt.getFileName('abc.txt')
      const newFilename3 = fileMgmt.getFileName('a/name/with/slashes.txt')
      assert.equal(newFilename1, 'abc_additional.txt')
      assert.equal(true, /^abc_\d+\.txt$/.test(newFilename2))
      assert.equal(true, /^a%2Fname%2Fwith%2Fslashes_\d+\.txt$/.test(newFilename3))
    })
  })
})
