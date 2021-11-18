/**
 * @description A function to create closure over the prefix of DynamoDB item
 * 
 * @param prefix The prefix to add or remove
 * 
 * @returns functions to add and remove prefix
 */
function handlePrefix(prefix: string) {
      const addPrefixTo = (attribute: string) => prefix + attribute

      const removePrefixFrom = (attribute: string) => attribute.substring(prefix.length)

      return {
            addPrefixTo,
            removePrefixFrom
      }
}

export const handlePrefixDON = handlePrefix('DON#')
export const handlePrefixUSR = handlePrefix('USR#')