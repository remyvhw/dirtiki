<template>
    <pre v-html="styledDiff"></pre>
</template>
<script type="text/babel">
var jsDiff = require("diff");

export default {
  props: {
    before: {
      type: String
    },
    after: {
      type: [String],
      required: true
    },
    diff: {
      type: String
    }
  },
  computed: {
    styledDiff() {
      if (!this.before) {
        return this.createSpanNodeWithClass(this.after, "diff-new", "div");
      }

      let allLines = this.diff.split("\n");
      return window
        .collect(allLines)
        .reject(line => {
          return ["--- Original", "+++ New", "@@ @@"].includes(line);
        })
        .pipe(lines => {
          allLines = lines.toArray();
          return window.collect(allLines);
        })
        .map((line, index) => {
          if (line === " " || !line) {
            return index === 0 || index === allLines.length - 1 ? null : line;
          }
          return line;
        })
        .reject(line => {
          return line === null;
        })
        .pipe(lines => {
          allLines = lines.toArray();
          return window.collect(allLines);
        })
        .map((line, index) => {
          let nextLine = allLines[index + 1];
          let previousLine = allLines[index - 1];
          if (line.startsWith("-") && nextLine.startsWith("+")) {
            return [line, nextLine];
          }
          if (line.startsWith("+") && previousLine.startsWith("-")) {
            return null;
          }
          return line;
        })
        .reject(line => {
          return line === null;
        })
        .map(line => {
          if (typeof line === "object") {
            return this.styleUpdatedLines(line);
          } else if (line.startsWith("+")) {
            return this.styleAddedLine(line);
          } else if (line.startsWith("-")) {
            return this.styleOriginalLine(line);
          }
          return this.stylePlainLine(line);
        })
        .implode("\n");
    }
  },
  methods: {
    createSpanNodeWithClass(text, className, element = "span") {
      let span = document.createElement(element);
      span.classList.add(className);
      span.appendChild(document.createTextNode(text));
      return span.outerHTML;
    },
    stylePlainLine(line) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-regular");
    },
    styleOriginalLine(line, nextLine) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-original");
    },
    styleAddedLine(line) {
      return this.createSpanNodeWithClass(line.substr(1), "diff-new");
    },
    styleUpdatedLines(lines) {
      const before = lines[0].substr(1);
      const after = lines[1].substr(1);
      if (!after) {
        return this.styleOriginalLine(lines[0]);
      } else if (!before) {
        return this.styleAddedLine(lines[1]);
      }
      const diffs = jsDiff.diffChars(before, after);
      if (diffs.length === 1 && diffs[0].added) {
        return this.styleAddedLine("+" + diffs[0].value);
      } else if (diffs.length === 1 && diffs[0].removed) {
        return this.styleOriginalLine("-" + diffs[0].value);
      } else if (diffs.length === 1) {
        return this.stylePlainLine(" " + diffs[0].value);
      }

      let dummyNode = document.createElement("span");
      dummyNode.classList.add("diff-updated");
      diffs.forEach(part => {
        let partClass = part.added
          ? "diff-fragment-added"
          : part.removed ? "diff-fragment-removed" : "diff-fragment-regular";
        let span = document.createElement("span");
        span.classList.add(partClass);
        span.appendChild(document.createTextNode(part.value));
        dummyNode.appendChild(span);
      });

      return dummyNode.outerHTML;
    }
  }
};
</script>
