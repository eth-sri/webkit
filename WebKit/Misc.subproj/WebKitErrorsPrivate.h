/*
        WebKitErrorsPrivate.h
	Copyright 2003, Apple, Inc. All rights reserved.

        Private header file.
*/

#import <WebKit/WebKitErrors.h>

#import <WebFoundation/WebError.h>

@interface WebError (WebExtras)
+ (WebError *)_webKitErrorWithCode:(int)code failingURL:(NSString *)URL;
@end

