package org.openmetadata.service.search.indexes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.SneakyThrows;
import org.openmetadata.schema.tests.TestCase;
import org.openmetadata.schema.tests.TestSuite;
import org.openmetadata.schema.type.EntityReference;
import org.openmetadata.schema.type.Include;
import org.openmetadata.service.Entity;
import org.openmetadata.service.search.SearchIndexUtils;
import org.openmetadata.service.search.models.SearchSuggest;
import org.openmetadata.service.util.JsonUtils;

public record TestCaseIndex(TestCase testCase) implements SearchIndex {
  private static final List<String> excludeFields = List.of("changeDescription");

  @SneakyThrows
  public Map<String, Object> buildESDoc() {
    List<TestSuite> testSuiteArray = new ArrayList<>();
    if (testCase.getTestSuites() != null) {
      for (TestSuite suite : testCase.getTestSuites()) {
        suite.setChangeDescription(null);
        testSuiteArray.add(suite);
      }
    }
    testCase.setTestSuites(testSuiteArray);
    Map<String, Object> doc = JsonUtils.getMap(testCase);
    SearchIndexUtils.removeNonIndexableFields(doc, excludeFields);
    List<SearchSuggest> suggest = new ArrayList<>();
    suggest.add(SearchSuggest.builder().input(testCase.getFullyQualifiedName()).weight(5).build());
    suggest.add(SearchSuggest.builder().input(testCase.getName()).weight(10).build());
    doc.put(
        "fqnParts",
        getFQNParts(
            testCase.getFullyQualifiedName(),
            suggest.stream().map(SearchSuggest::getInput).toList()));
    doc.put("suggest", suggest);
    doc.put("entityType", Entity.TEST_CASE);
    doc.put("owner", getEntityWithDisplayName(testCase.getOwner()));
    return doc;
  }

  public Map<String, Object> buildESDocForCreate() {
    EntityReference testSuiteEntityReference = testCase.getTestSuite();
    TestSuite testSuite = getTestSuite(testSuiteEntityReference.getId());
    List<TestSuite> testSuiteArray = new ArrayList<>();
    testSuiteArray.add(testSuite);
    Map<String, Object> doc = JsonUtils.getMap(testCase);
    SearchIndexUtils.removeNonIndexableFields(doc, excludeFields);
    doc.put("testSuites", testSuiteArray);
    return doc;
  }

  private TestSuite getTestSuite(UUID testSuiteId) {
    TestSuite testSuite = Entity.getEntity(Entity.TEST_SUITE, testSuiteId, "", Include.ALL);
    return new TestSuite()
        .withId(testSuite.getId())
        .withName(testSuite.getName())
        .withDisplayName(testSuite.getDisplayName())
        .withDescription(testSuite.getDescription())
        .withFullyQualifiedName(testSuite.getFullyQualifiedName())
        .withDeleted(testSuite.getDeleted())
        .withHref(testSuite.getHref())
        .withExecutable(testSuite.getExecutable())
        .withChangeDescription(null);
  }

  public static Map<String, Float> getFields() {
    Map<String, Float> fields = SearchIndex.getDefaultFields();
    fields.put("testSuite.fullyQualifiedName", 10.0f);
    fields.put("testSuite.name", 10.0f);
    fields.put("testSuite.description", 1.0f);
    fields.put("entityLink", 3.0f);
    fields.put("entityFQN", 10.0f);
    return fields;
  }
}
