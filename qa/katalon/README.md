# Boundless Server QA - Katalon

[Katalon](https://www.katalon.com/) is used for integration testing Web UI and Web API components in Boundless Server.

*The following content is currently under construction, and subject to change at any time.*

## Running Tests

### Prerequisites:

Before running any tests using Katalon, the Boundless Server instance to be tested must be running on http://localhost:8080.

In addition, the [test data bundle](../test_data) must be copied into the GeoServer data directory of that server instance.

### Running Tests using Katalon Studio

*Katalon Studio must be installed*

Open Katalon Studio.

Select "File > Open Project", and navigate to this directory.

Under "Test Suites", select the Test Suite you wish to run. Click the "Run" button.


### Running Tests using Command Line

*Katalon Studio must be installed*

Windows:

    {path_to_katalon}\katalon -runMode=console -consoleLog -noExit -projectPath="%cd%" -testSuitePath="Test Suites/{test_suite_name}" -browserType="Chrome"

Mac OS:

    /Applications/Katalon\ Studio.app/Contents/MacOS/katalon --args -runMode=console -consoleLog -projectPath=$(pwd) -testSuitePath=Test\ Suites/{test_suite_name} -browserType=Chrome

Linux:

    {path_to_katalon}/katalon -runMode=console -consoleLog -projectPath=$(pwd) -testSuitePath=Test\ Suites/{test_suite_name} -browserType=Chrome

Where `{path_to_katalon}` and `{test_suite_name}` are replaced with the appropriate values.

Execution reports will be generated in the Reports directory.

### Running Tests using Docker

*Docker must be installed*
*Katalon Studio does **not** need to be installed*

    docker run --rm -v $PWD:/katalon/katalon/source:ro -e BROWSER_TYPE="Chrome" -e TEST_SUITE_PATH="Test Suites/{test_suite_name}" -e DOCKER_PROXY_ALIAS="nginx" quay.io/boundlessgeo/b7s-katalon:federal

Where `{test_suite_name}` is replaced with the appropriate value.

## Adding New Tests

### Style Guide

#### Test Cases

New test cases should be added under the appropriate subfolder:

    Test Cases/{Component}/

Test cases should be named according to the following naming scheme:

    {Type}_[{Subcomponent}_]{ShortDescription}

#### Object Repository

Test cases also require some number of associated objects in the object repository.
There are two main types of objects: 

1. Elements represent HTML elements on a web page, and should be added under:
   
       Object Repository/Web/{Component}/{Page_Name}/
   
   Elements can use the default Katalon naming scheme if it is sufficiently clear. This generally follows the following scheme:
   
       {html_tag}_{Element_text}

2. Web Service Requests represent an HTTP request, typically against a RESTful API. They should be added under:
   
       Object Repository/Api/{Component}/
   
   Web Service Requests should be named under the following scheme:

       {api_root}-{endpoint}_{ShortDescription}_{METHOD}

#### Glossary

* `{Component}` - The Boundless Server Component, e.g. GeoServer
* `{Type}` - The type of test or test object. `Web` for web tests or `Api` for API tests.
* `{Subcomponent}` - The subcomponent or web page being tested, e.g. Importer.
* `{ShortDescription}` - A minimal, CamelCase description of the test or test object
* `{Page_Name}` - The name of the page, of the form `Page_{ShortTitle}`. `{ShortTitle}` Should be a short, CamelCase page title.
* `{html_tag}` - The html tag of the element, e.g. `a` or `span`.
* `{Element_text}` - The visible text of the element, or the class hierachy if the element has no text.
* `{api_root}` - The root of the api, e.g `rest`.
* `{endpoint}` - The endpoint being tested, e.g. `imports`.
* `{METHOD}` - The HTTP method, e.g. `GET`.

### Adding a new web test

1. Create a new test case.
2. Click the "Record" button, and run through the test in the window that appears (you may have to click the browser icon in the record window).
3. When your test is complete, stop the recording. Remove any unecessary steps, and click OK.
4. You will be prompted to add Elements to the Object Repository for this test. 
5. Deselect any Elements that are not actually needed by your test (Any element that you clicked on during the recording is added by default).
6. If you are testing a new page, ensure "Create new folder(s) as page's name" is checked. Otherwise, select the appropriate page subfolder in the Object repository view. Click OK to add the elements to the Object repository.
7. If testing GeoServer, edit each newly added Element and remove any refernces to id. Wicket generates element ids at runtime, so they are not guaranteed to be consistent between test runs.
8. Run the recorded test to ensure it works, fixing any errors if necessary.

### Adding a new API test

1. Create a new test case
2. For each HTTP request required by the test, create a new Web Service Request object (unless an equivalent one already exists).
3. Add the requests to the test case using "Add > Web Service Keyword" and selecting "Send Request".
4. Add verification steps to the test case.