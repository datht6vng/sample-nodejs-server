package util

import (
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/juju/errors"
)

/*
RemoveItemInSortedSlice remove all element that valid compare from a sorted slice
@ compare is the comparison of values in the array, receive an index i for each search, return 0 if value == a[i], > 0 if value > a[i], < 0 if value < b[i]

	// Define cmp(-1) > 0 and cmp(n) <= 0
	// Invariant: in any of search round from i to j, cmp(i-1) > 0, cmp(j) <= 0

example: if we want to remove an element name value from array name a, we use comapare as : func(i int) int {return value - a[i]}
*/
func RemoveItemInSortedSlice[T any](arr []T, compare func(int) int) []T {
	start, end := SearchRange(arr, compare)

	if start >= 0 && end >= 0 {
		arr = append(arr[:start], arr[end+1:]...)
	}
	return arr
}

/*
SearchRange return a range of value in arr, it will return -1, -1 if not found the valid rangee

@ arr is an array of values

@ value is the value that is needed to search

@ compare is the comparison of values in the array, receive an index i, return 0 if value == a[i], > 0 if value > a[i], < 0 if value < b[i]

	// Define cmp(-1) > 0 and cmp(n) <= 0
	// Invariant: in any of search round from i to j, cmp(i-1) > 0, cmp(j) <= 0

@ Time complexity: O(log(n))

@ Space complexity: O(1)
*/
func SearchRange[T any](arr []T, compare func(int) int) (lowerBound, upperBound int) {
	lowerBound = -1
	upperBound = -1
	if len(arr) == 0 {
		return lowerBound, upperBound
	}
	// Find lower bound
	start := 0
	end := len(arr) - 1

	for start < end {
		mid := (start + end) / 2
		// compare with "<=" to get left most
		if compare(mid) <= 0 {
			end = mid
		} else {
			start = mid + 1
		}
	}
	if compare(start) != 0 {
		return lowerBound, upperBound
	}

	lowerBound = start

	// Find for upper bound
	end = len(arr) - 1
	for start < end {
		mid := (start+end)/2 + 1
		// compare with "<" to get right most
		if compare(mid) < 0 {
			end = mid - 1
		} else {
			start = mid
		}
	}
	upperBound = end
	return lowerBound, upperBound
}

/*
InsertSorted insert a value to an sorted array of type T
* arr is the array of values
* value is the value to insert
@ compare is the comparison of values in the array, receive an index i, return true if value <= arr[i], false if value > arr

	// Define cmp(-1) > 0 and cmp(n) <= 0
	// Invariant: in any of search round from i to j, cmp(i-1) > 0, cmp(j) <= 0
*/
func InsertSorted[T any](arr []T, value T, compare func(int) bool) []T {
	i := sort.Search(len(arr), compare)
	arr = append(arr, value) // temporary append array size
	copy(arr[i+1:], arr[i:])
	arr[i] = value
	return arr
}

/*
InsertSortedString wrap type string
*/
func InsertSortedString(arr []string, s string) []string {
	return InsertSorted(arr, s, func(i int) bool {
		return strings.Compare(s, arr[i]) < 0
	})
}

/*
ShallowCopy make a shallow copy of current object
*/
func ShallowCopy[T any](obj *T) *T {
	result := new(T)
	*result = *obj
	return result
}

func FileNameWithoutExt(fileName string) string {
	return strings.TrimSuffix(fileName, filepath.Ext(fileName))
}

func GetIndex(dir string) (int, error) {
	files, err := os.ReadDir(dir)
	if err != nil {
		return 0, errors.Annotate(err, "cannot read dir")
	}
	index := 0
	for _, file := range files {
		filename := FileNameWithoutExt(file.Name())
		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			continue
		}
		currentIndex := parts[1]
		i, _ := strconv.ParseInt(currentIndex, 10, 32)
		if int(i) >= index {
			index = int(i + 1)
		}
	}
	return index, nil
}

// SearchElementOrSmaller return the index of the element if it exists, otherwise return the index of smaller element
// compare fucntion return -1, 0, 1 in case smaller, equal, or greater
func SearchElementOrSmaller[ArrayType any, TargetType any](arr []ArrayType, target TargetType, compare func(a TargetType, b ArrayType) int64) int {
	i := sort.Search(len(arr), func(i int) bool {
		return compare(target, arr[i]) <= 0
	})

	if i >= len(arr) {
		// Target is larger than all elements in array, return the last element
		return len(arr) - 1
	}

	// Nearest element is either arr[i-1] or arr[i]
	if compare(target, arr[i]) == 0 {
		return i
	}

	return i - 1
}
