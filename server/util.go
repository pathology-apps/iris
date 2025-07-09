package main

import (
	"crypto/md5"
	"fmt"
	"net/url"
	"strings"
)

func StringJoin(strings []string, sep string) string {
	var result string
	for i, s := range strings {
		if i > 0 {
			result += sep
		}
		result += s
	}
	return result
}

func ComputeMD5(s string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(s)))
}

func openWebScope(origUrl string) string {
	parsedURL, err := url.Parse(origUrl)
	if err != nil {
		fmt.Println("Error parsing URL:", err)
		return ""
	}
	pathSegments := strings.Split(parsedURL.Path, "/")
	if len(pathSegments) < 2 {
		fmt.Println("Unexpected URL format")
		return ""
	}
	desiredPath := strings.Join(pathSegments[1:len(pathSegments)-1], "/")
	encodedPath := strings.ReplaceAll(desiredPath, " ", "%20")
	encodedPath = strings.ReplaceAll(encodedPath, "&", "%26")
	fullEncodedPath := url.PathEscape(encodedPath)
	return fullEncodedPath
}
