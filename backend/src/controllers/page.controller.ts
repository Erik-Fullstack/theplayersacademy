import { Request, Response } from "express";
import path from "node:path";
import { readFile, writeFile } from "node:fs";

// Functions:
//CREATE PAGE
//CREATE PAGE SECTION
//GET CONFIG
//GET PAGES
//GET ITERABLE PAGES
//GET PAGE CONTENT
//UPDATE PAGE SECTION
//DELETE PAGE
//DELETE PAGE SECTION

interface Section {
  id: string;
  title: string;
  text: string;
}
type Page = {
  id: string;
  url?: string;
  isIterable: boolean;
  sections: Section[];
};

const contentFilePath = path.join(__dirname, "../config/pageContent.json");

export class PageController {
  // *
  // * CREATE PAGE
  // *
  async createPage(req: Request, res: Response) {
    const { name, id, url, isIterable } = req.body;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        if (name.length === 0 || id.length === 0) {
          res.status(400).json({ error: "Name and or id must have a value" });
          return;
        }
        const data = JSON.parse(file);
        const trimmedName = name.replace(/\s+/g, "").toLowerCase();
        if (
          typeof trimmedName !== "string" ||
          typeof id !== "string" ||
          typeof isIterable !== "boolean"
        ) {
          res.status(400).json({ error: "Invalid page format" });
          return;
        } else if (url && typeof url !== "string") {
          res.status(400).json({ error: "Invalid page format" });
          return;
        } else if (trimmedName in data) {
          res
            .status(409)
            .json({ error: `Page "${trimmedName}" already exists!` });
          return;
        }
        const updatedData = {
          ...data,
          [trimmedName]: {
            id,
            url,
            isIterable,
            sections: [],
          } as Page,
        };
        writeFile(filePath, JSON.stringify(updatedData), (readError) => {
          if (readError) {
            console.error(readError);
            res.status(500).json({ error: "Error writing content file" });
            return;
          }
          res.status(201).json({ data: updatedData[trimmedName] });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * CREATE PAGE SECTION
  // *
  async createPageSection(req: Request, res: Response) {
    const { sectionId, title, text } = req.body;
    const { page } = req.params;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        if (sectionId.length === 0 || title.length === 0 || text.length === 0) {
          res
            .status(400)
            .json({
              error: "section id, title and text must all have a value",
            });
          return;
        }
        const data = JSON.parse(file);
        const newSection: Section = { id: sectionId, title, text };
        const currentSections = data[page.toLowerCase()].sections;
        if (
          currentSections.find(
            (section: Section) =>
              section.id.toLowerCase() === sectionId.toLowerCase()
          )
        ) {
          res
            .status(409)
            .json({ error: `Section "${newSection.id}" already exists!` });
          return;
        }
        const updatedSections = [...currentSections, newSection];
        data[page.toLowerCase()].sections = updatedSections;
        writeFile(filePath, JSON.stringify(data), (writeError) => {
          if (writeError) {
            console.error(writeError);
            res.status(500).json({ error: "Error writing content file" });
            return;
          }
        });
        res.status(200).json({ data: newSection });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * GET CONFIG
  // *
  async getConfig(req: Request, res: Response) {
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        res.status(200).json({ data: data });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * GET PAGES
  // *
  async getPages(req: Request, res: Response) {
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        const currentPages = Object.keys(data);
        res.status(200).json({ data: currentPages });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * GET ITERABLE PAGES
  // *
  async getIterablePages(req: Request, res: Response) {
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file) as Record<string, Page>;
        const iterablePages = Object.entries(data)
          .filter((page) => {
            if (page[1].isIterable) {
              return page[0];
            }
          })
          .map((page) => page[0]);
        res.status(200).json({ data: iterablePages });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * GET PAGE CONTENT
  // *
  async getPageContent(req: Request, res: Response) {
    //content bestämmer vilken content man vill uppdatera (just nu "title" eller "text").
    //id är vilken ID av sectionen på sidan
    const { content, id } = req.query;
    const { page } = req.params;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    if (typeof content !== "string" || typeof id !== "string") {
      res.status(400).json({ error: "Missing or invalid query parameters" });
      return;
    }

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        const pageData = data[page.toLowerCase()].sections.find(
          (section: Section) => section.id.toLowerCase() === id.toLowerCase()
        );
        res.status(200).json({ data: pageData[content] });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * UPDATE PAGE SECTION
  // *
  async updatePageSection(req: Request, res: Response) {
    const { content, updatedData } = req.body;
    const { page, sectionId } = req.params;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        const currentSections = data[page.toLowerCase()].sections;
        const updatedSections = currentSections.map((section: Section) => {
          if (section.id === sectionId) {
            return { ...section, [content]: updatedData };
          }
          return section;
        });
        data[page.toLowerCase()].sections = updatedSections;
        writeFile(filePath, JSON.stringify(data), (writeError) => {
          if (writeError) {
            console.error(writeError);
            res.status(500).json({ error: "Error writing content file" });
            return;
          }
        });
        res
          .status(200)
          .json({
            data: data[page.toLowerCase()].sections.filter(
              (section: Section) => section.id === sectionId
            )[0],
          });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * DELETE PAGE
  // *
  async deletePage(req: Request, res: Response) {
    const { page } = req.params;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        if (!(page in data)) {
          res.status(404).json({ error: `Page "${page}" not found` });
          return;
        }
        delete data[page];
        writeFile(filePath, JSON.stringify(data), (readError) => {
          if (readError) {
            console.error(readError);
            res.status(500).json({ error: "Error writing prices file" });
            return;
          }
          res.status(200).json({ message: "Page removed successfully" });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }

  // *
  // * DELETE PAGE SECTION
  // *
  async deletePageSection(req: Request, res: Response) {
    const { page, sectionId } = req.params;
    const filePath = path.join(__dirname, "../config/pageContent.json");

    readFile(filePath, "utf-8", (readError, file) => {
      if (readError) {
        console.error(readError);
        res.status(500).json({ error: "Error reading content file" });
        return;
      }
      try {
        const data = JSON.parse(file);
        const currentSections = data[page.toLowerCase()].sections;
        if (
          !currentSections.some((section: Section) => section.id == sectionId)
        ) {
          res
            .status(404)
            .json({
              error: `Section "${sectionId}" doesn't exist on this page`,
            });
          return;
        }
        const updatedSections = currentSections.filter(
          (section: Section) => section.id !== sectionId
        );

        data[page.toLowerCase()].sections = [...updatedSections];

        writeFile(filePath, JSON.stringify(data), (writeError) => {
          if (writeError) {
            console.error(writeError);
            res.status(500).json({ error: "Error writing content file" });
            return;
          }
        });
        res
          .status(200)
          .json({ data: `Section "${sectionId}" removed successfully` });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    });
  }
}

export const pageController = new PageController();
