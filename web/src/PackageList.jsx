import React, { Fragment } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Chip from "@material-ui/core/Chip";
import DoneIcon from "@material-ui/icons/Done";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Badge from "@material-ui/core/Badge";
import PackageDetails from "./PackageDetails";

const useStyles = makeStyles((theme) => ({
  chip: {
    margin: "0 3px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  }
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -20,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "12px 8px"
  }
}))(Badge);

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black
  },
  tooltip: {
    backgroundColor: theme.palette.common.black
  }
}));

function BootstrapTooltip(props) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

const VersionChip = ({ className, version, latestVersion }) => {
  const isLatest = version === latestVersion;

  const chip = (
    <Chip
      key={version}
      className={className}
      label={version}
      color={isLatest ? "primary" : "secondary"}
      icon={isLatest ? <DoneIcon /> : <ErrorOutlineIcon />}
    />
  );

  if (isLatest) {
    return chip;
  }
  return <BootstrapTooltip title={`Latest version is ${latestVersion}`}>{chip}</BootstrapTooltip>;
};

const PackageList = ({ packages }) => {
  const classes = useStyles();

  return (
    <Fragment>
      {packages.map((dep) => (
        <Accordion key={dep.name}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Grid container>
              <Grid item xs={4}>
                <Typography variant={"body1"} className={classes.heading} color={"primary"}>
                  {dep.name}
                </Typography>
                <Typography variant={"caption"}>{dep.description}</Typography>
              </Grid>
              <Grid item xs={4}>
                {dep.versions.map((version) => (
                  <VersionChip
                    key={version}
                    className={classes.chip}
                    version={version}
                    latestVersion={dep.latestVersion}
                  />
                ))}
              </Grid>
              <Grid item xs={4}>
                <BootstrapTooltip
                  title={`This package is used by ${dep.usedBy.length} workspace(s).`}
                >
                  <StyledBadge color="secondary" badgeContent={dep.usedBy.length}>
                    <Typography>Used by</Typography>
                  </StyledBadge>
                </BootstrapTooltip>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <PackageDetails dep={dep} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Fragment>
  );
};

export default React.memo(PackageList);
