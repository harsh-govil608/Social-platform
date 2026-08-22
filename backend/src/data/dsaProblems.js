export const dsaProblems = [
  // Easy Problems
  {
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    tags: ["Array", "Hash Table"],
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    hints: [
      "A brute force approach would be to check all pairs of numbers.",
      "Can you use a hash table to improve the time complexity?"
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`
    },
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isHidden: false },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]", isHidden: false },
      { input: "[3,3]\n6", expectedOutput: "[0,1]", isHidden: false },
      { input: "[1,5,3,7,8]\n9", expectedOutput: "[0,4]", isHidden: true },
      { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2,4]", isHidden: true }
    ],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Apple"]
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    category: "String",
    tags: ["String", "Two Pointers"],
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "The reversed string is 'olleh'."
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: "The reversed string is 'hannaH'."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is a printable ascii character."
    ],
    hints: [
      "Use two pointers, one at the beginning and one at the end.",
      "Swap characters and move pointers towards each other."
    ],
    starterCode: {
      javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    
};`,
      python: `class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        `,
      java: `class Solution {
    public void reverseString(char[] s) {
        
    }
}`,
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        
    }
};`
    },
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false },
      { input: '["a"]', expectedOutput: '["a"]', isHidden: true }
    ],
    companies: ["Microsoft", "Apple", "Adobe"]
  },
  {
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    tags: ["Math"],
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.

For example, 121 is a palindrome while 123 is not.`,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      },
      {
        input: "x = 10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome."
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    hints: [
      "Could negative numbers be palindromes?",
      "Try reversing the integer. If overflow, what should you do?",
      "Could you solve it without converting the integer to a string?"
    ],
    starterCode: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    
};`,
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        `,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        
    }
};`
    },
    testCases: [
      { input: "121", expectedOutput: "true", isHidden: false },
      { input: "-121", expectedOutput: "false", isHidden: false },
      { input: "10", expectedOutput: "false", isHidden: false },
      { input: "0", expectedOutput: "true", isHidden: true },
      { input: "1221", expectedOutput: "true", isHidden: true }
    ],
    companies: ["Amazon", "Bloomberg", "Microsoft"]
  },

  // Medium Problems
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "String",
    tags: ["String", "Sliding Window", "Hash Table"],
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    hints: [
      "Use a sliding window approach.",
      "Use a hash set to track characters in the current window.",
      "When you find a duplicate, shrink the window from the left."
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        `,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: "3", isHidden: false },
      { input: '"bbbbb"', expectedOutput: "1", isHidden: false },
      { input: '"pwwkew"', expectedOutput: "3", isHidden: false },
      { input: '""', expectedOutput: "0", isHidden: true },
      { input: '" "', expectedOutput: "1", isHidden: true }
    ],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Bloomberg"]
  },
  {
    title: "Add Two Numbers",
    difficulty: "Medium",
    category: "LinkedList",
    tags: ["Linked List", "Math"],
    description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]",
        explanation: "0 + 0 = 0."
      },
      {
        input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
        output: "[8,9,9,9,0,0,0,1]",
        explanation: "9999999 + 9999 = 10009998."
      }
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    hints: [
      "Iterate through both lists simultaneously.",
      "Keep track of the carry.",
      "Handle the case when lists have different lengths."
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        `,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        
    }
};`
    },
    testCases: [
      { input: "[2,4,3]\n[5,6,4]", expectedOutput: "[7,0,8]", isHidden: false },
      { input: "[0]\n[0]", expectedOutput: "[0]", isHidden: false },
      { input: "[9,9,9,9,9,9,9]\n[9,9,9,9]", expectedOutput: "[8,9,9,9,0,0,0,1]", isHidden: false }
    ],
    companies: ["Amazon", "Microsoft", "Bloomberg", "Apple", "Adobe"]
  },
  {
    title: "3Sum",
    difficulty: "Medium",
    category: "Array",
    tags: ["Array", "Two Pointers", "Sorting"],
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2]."
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
        explanation: "The only possible triplet does not sum up to 0."
      },
      {
        input: "nums = [0,0,0]",
        output: "[[0,0,0]]",
        explanation: "The only possible triplet sums up to 0."
      }
    ],
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    hints: [
      "Sort the array first.",
      "For each element, use two pointers to find pairs that sum to its negative.",
      "Skip duplicates to avoid duplicate triplets."
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    
};`,
      python: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        `,
      java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        
    }
};`
    },
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false },
      { input: "[0,1,1]", expectedOutput: "[]", isHidden: false },
      { input: "[0,0,0]", expectedOutput: "[[0,0,0]]", isHidden: false }
    ],
    companies: ["Amazon", "Facebook", "Microsoft", "Google", "Bloomberg"]
  },

  // Hard Problems
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Array",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    hints: [
      "Think about binary search.",
      "Can you partition the arrays such that all elements on the left are smaller than all elements on the right?"
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    
};`,
      python: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        `,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        
    }
}`,
      cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        
    }
};`
    },
    testCases: [
      { input: "[1,3]\n[2]", expectedOutput: "2.00000", isHidden: false },
      { input: "[1,2]\n[3,4]", expectedOutput: "2.50000", isHidden: false }
    ],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Adobe"]
  },

  // Tree Problems
  {
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    category: "Tree",
    tags: ["Tree", "Stack", "DFS"],
    description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Inorder traversal: left -> root -> right"
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "Empty tree"
      },
      {
        input: "root = [1]",
        output: "[1]",
        explanation: "Single node"
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    hints: [
      "You can solve this recursively or iteratively.",
      "For iterative solution, use a stack."
    ],
    starterCode: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function(root) {
    
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        `,
      java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        
    }
}`,
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        
    }
};`
    },
    testCases: [
      { input: "[1,null,2,3]", expectedOutput: "[1,3,2]", isHidden: false },
      { input: "[]", expectedOutput: "[]", isHidden: false },
      { input: "[1]", expectedOutput: "[1]", isHidden: false }
    ],
    companies: ["Microsoft", "Google", "Amazon"]
  },

  // Dynamic Programming
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "DynamicProgramming",
    tags: ["Dynamic Programming", "Math", "Memoization"],
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps"
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step"
      }
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    hints: [
      "This is essentially a Fibonacci problem.",
      "Think about the base cases.",
      "From each step, you can reach it from the previous step or the step before that."
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    
};`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        `,
      java: `class Solution {
    public int climbStairs(int n) {
        
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        
    }
};`
    },
    testCases: [
      { input: "2", expectedOutput: "2", isHidden: false },
      { input: "3", expectedOutput: "3", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: true },
      { input: "4", expectedOutput: "5", isHidden: true },
      { input: "5", expectedOutput: "8", isHidden: true }
    ],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Bloomberg"]
  }
];

export default dsaProblems;